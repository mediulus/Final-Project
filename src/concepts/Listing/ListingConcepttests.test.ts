import { assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import ListingConcept, { Listing } from "./ListingConcept.ts";
import UserInfoConcept from "../UserInfo/UserInfoConcept.ts"; // Assuming this path
import { ID } from "@utils/types.ts";

// Helper function to create dates easily
function d(dateString: string): Date {
  return new Date(dateString);
}

Deno.test("Listing Concept", async (t) => {
  // Setup: Initialize database and concept instances
  const [db, client] = await testDb();
  const listingConcept = new ListingConcept(db);
  const userInfoConcept = new UserInfoConcept(db);

  // 1. Setup Dummy Users via UserInfoConcept
  // We need valid user IDs to act as 'listers'
  const user1Id = "user_alice" as ID;
  const user2Id = "user_bob" as ID;

  await userInfoConcept.setInfo({
    user: user1Id,
    age: 20,
    gender: 0, // Female
    affiliation: 0, // Undergraduate
    emailAddress: "alice@example.com",
  });

  await userInfoConcept.setInfo({
    user: user2Id,
    age: 21,
    gender: 1, // Male
    affiliation: 0,
    emailAddress: "bob@example.com",
  });

  // Common test data
  const address1 = "123 Main St, Cambridge";
  const address2 = "456 Broadway, Cambridge";

  let listing1: Listing; // Will store the main listing used across tests

  Deno.test("1. create action", async (t) => {
    await t.step(
      "1.1. effects: should successfully create a listing with valid data",
      async () => {
        const result = await listingConcept.create(
          user1Id,
          "Alice's Summer Sublet",
          [], // No amenities yet
          [], // No photos yet
          address1,
          d("2025-06-01"),
          d("2025-08-01"),
          500
        );

        assertEquals("error" in result, false, "Should return listing object");
        listing1 = result as Listing;

        // Verify properties
        assertObjectMatch(listing1, {
          lister: user1Id,
          title: "Alice's Summer Sublet",
          address: address1,
          price: 500,
        });

        // Verify persistence
        const fetched = await listingConcept.getListingById(listing1._id);
        assertObjectMatch(fetched!, { _id: listing1._id });
      }
    );

    await t.step(
      "1.2. requires: should fail if startDate is after endDate",
      async () => {
        const result = await listingConcept.create(
          user1Id,
          "Bad Dates",
          [],
          [],
          address2,
          d("2025-09-01"), // Start
          d("2025-08-01"), // End (before start)
          500
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error,
          "Create listing failed: Start date must be strictly before end date."
        );
      }
    );

    await t.step(
      "1.3. requires: should fail if a listing exists at the same address with overlapping dates",
      async () => {
        // Attempt to create a listing for Bob at Alice's address with overlapping dates
        // Alice: June 1 - Aug 1
        // Bob attempts: July 1 - Sept 1
        const result = await listingConcept.create(
          user2Id,
          "Bob's Invasion",
          [],
          [],
          address1, // Same address as Alice
          d("2025-07-01"),
          d("2025-09-01"),
          600
        );

        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("overlaps"),
          true,
          "Should detect date/address conflict"
        );
      }
    );

    await t.step(
      "1.4. effects: should create a second listing if address differs",
      async () => {
        const result = await listingConcept.create(
          user2Id,
          "Bob's Place",
          [],
          [],
          address2, // Different address
          d("2025-06-01"),
          d("2025-08-01"),
          550
        );
        assertEquals("error" in result, false);
      }
    );
  });

  Deno.test("2. edit attributes (Title, Price, Address)", async (t) => {
    await t.step("2.1. effects: should update title", async () => {
      const result = await listingConcept.editTitle(
        listing1._id,
        "Alice's Cozy Room"
      );
      assertEquals("error" in result, false);
      assertEquals((result as Listing).title, "Alice's Cozy Room");
    });

    await t.step("2.2. effects: should update price", async () => {
      const result = await listingConcept.editPrice(listing1._id, 450);
      assertEquals("error" in result, false);
      assertEquals((result as Listing).price, 450);
    });

    await t.step("2.3. requires: should fail to set negative price", async () => {
      const result = await listingConcept.editPrice(listing1._id, -100);
      assertEquals("error" in result, true);
    });

    await t.step("2.4. requires: should fail to update address if it causes conflict", async () => {
      // Trying to move listing1 (Alice) to address2 (Bob's address)
      // Dates overlap (both are June-Aug), so this should fail
      const result = await listingConcept.editAddress(listing1._id, address2);
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error.includes("overlaps"),
        true
      );
    });
  });

  Deno.test("3. Manage Photos", async (t) => {
    const photoData = {
      url: "http://example.com/room.jpg",
      alt: "Bedroom",
    };

    await t.step("3.1. effects: should add a photo", async () => {
      const result = await listingConcept.addPhoto(listing1._id, photoData);
      assertEquals("error" in result, false);
      const updated = result as Listing;
      assertEquals(updated.photos.length, 1);
      assertEquals(updated.photos[0].url, photoData.url);

      // Update our local reference
      listing1 = updated;
    });

    await t.step("3.2. requires: should fail to add duplicate photo URL", async () => {
      const result = await listingConcept.addPhoto(listing1._id, photoData);
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error.includes("already exists"),
        true
      );
    });

    await t.step("3.3. effects: should remove a photo", async () => {
      const photoId = listing1.photos[0]._id;
      const result = await listingConcept.deletePhoto(listing1._id, photoId);
      assertEquals("error" in result, false);
      assertEquals((result as Listing).photos.length, 0);
      listing1 = result as Listing;
    });
  });

  Deno.test("4. Manage Amenities", async (t) => {
    await t.step("4.1. effects: should add an amenity", async () => {
      const result = await listingConcept.addAmenity(
        listing1._id,
        "Wifi",
        0
      );
      assertEquals("error" in result, false);
      const updated = result as Listing;
      assertEquals(updated.amenities.length, 1);
      assertEquals(updated.amenities[0].title, "Wifi");
      listing1 = updated;
    });

    await t.step("4.2. requires: should fail to add duplicate amenity", async () => {
      const result = await listingConcept.addAmenity(
        listing1._id,
        "Wifi",
        0
      );
      assertEquals("error" in result, true);
    });

    await t.step("4.3. effects: should delete an amenity", async () => {
      const amenityId = listing1.amenities[0]._id;
      const result = await listingConcept.deleteAmenity(
        listing1._id,
        amenityId
      );
      assertEquals("error" in result, false);
      assertEquals((result as Listing).amenities.length, 0);
      listing1 = result as Listing;
    });
  });

  Deno.test("5. Edit Dates (Conflicts)", async (t) => {
    // Current State:
    // Listing1 (Alice): Address1, June 1 - Aug 1
    // Listing2 (Bob): Address2, June 1 - Aug 1 (Created in 1.4)

    await t.step("5.1. requires: editStartDate fails if new date >= endDate", async () => {
      const result = await listingConcept.editStartDate(
        listing1._id,
        d("2025-08-05") // After current end date
      );
      assertEquals("error" in result, true);
    });

    await t.step("5.2. effects: editStartDate succeeds if no conflict", async () => {
      // Move start date later: July 1
      const result = await listingConcept.editStartDate(
        listing1._id,
        d("2025-07-01")
      );
      assertEquals("error" in result, false);
      listing1 = result as Listing;
      assertEquals(listing1.startDate, d("2025-07-01"));
    });

    // To test conflict on edit, let's create a 3rd listing at Address1
    // that sits in the gap we just created (June 1 - June 30)
    await listingConcept.create(
        "user3" as ID, "Gap Filler", [], [], address1, d("2025-06-01"), d("2025-06-30"), 300
    );

    await t.step("5.3. requires: editStartDate fails if expanding into conflict", async () => {
      // Alice tries to move start date back to June 15
      // This overlaps with "Gap Filler" (June 1 - June 30)
      const result = await listingConcept.editStartDate(
        listing1._id,
        d("2025-06-15")
      );
      assertEquals("error" in result, true);
      assertEquals((result as {error:string}).error.includes("overlaps"), true);
    });
  });

  Deno.test("6. delete action", async (t) => {
    await t.step("6.1. effects: should delete the listing", async () => {
      await listingConcept.delete(listing1._id);

      const check = await listingConcept.getListingById(listing1._id);
      assertEquals(check, null);
    });

    await t.step("6.2. requires: operations on deleted listing fail", async () => {
      const result = await listingConcept.editPrice(listing1._id, 100);
      assertEquals("error" in result, true);
      assertEquals((result as {error:string}).error.includes("not found"), true);
    });
  });

  // trace: Demonstrates the lifecycle of a listing being posted, updated, and removed.
  Deno.test("7. Principle Trace: Post -> Enrich -> Conflict -> Resolve", async (t) => {
    const traceUser = "traceUser" as ID;
    const traceAddress = "77 Mass Ave";
    let traceListing: Listing;

    // 1. User posts a listing
    await t.step("7.1. User posts a basic listing", async () => {
      const result = await listingConcept.create(
        traceUser,
        "MIT Dorm",
        [],
        [],
        traceAddress,
        d("2026-06-01"),
        d("2026-08-31"),
        1000
      );
      assertEquals("error" in result, false);
      traceListing = result as Listing;
    });

    // 2. User enriches listing with photos and amenities
    await t.step("7.2. User adds photos and amenities", async () => {
      await listingConcept.addAmenity(traceListing._id, "Gym", 0.5);
      const photoRes = await listingConcept.addPhoto(traceListing._id, {
        url: "http://mit.edu/dorm.jpg"
      });

      traceListing = photoRes as Listing;
      assertEquals(traceListing.amenities.length, 1);
      assertEquals(traceListing.photos.length, 1);
    });

    // 3. Another user tries to post at same address/time (Conflict)
    await t.step("7.3. Second user blocked by conflict", async () => {
      const result = await listingConcept.create(
        "otherUser" as ID,
        "Invader",
        [],
        [],
        traceAddress,
        d("2026-07-01"), // Overlaps
        d("2026-07-15"),
        500
      );
      assertEquals("error" in result, true);
    });

    // 4. First user shortens their listing dates
    await t.step("7.4. User changes dates (resolving potential future conflict)", async () => {
      // Change end date to July 1st
      const result = await listingConcept.editEndDate(
        traceListing._id,
        d("2026-07-01")
      );
      assertEquals("error" in result, false);
    });

    // 5. Now second user can post in the newly freed slot (July 2 - Aug)
    await t.step("7.5. Second user successfully posts in freed slot", async () => {
        const result = await listingConcept.create(
            "otherUser" as ID,
            "Success Post",
            [],
            [],
            traceAddress,
            d("2026-07-02"), // After July 1st
            d("2026-08-01"),
            500
          );
          assertEquals("error" in result, false);
    });
  });

  // Teardown
  await client.close();
});
