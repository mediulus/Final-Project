import { assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import RoommatePostingConcept, {
  Gender,
  RoommatePosting
} from "./RoommatePostingConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("RoommatePosting Concept", async (t) => {
  // Setup: Initialize database and concept instance
  const [db, client] = await testDb();
  const roommatePostingConcept = new RoommatePostingConcept(db);

  // Setup Dummy Users
  const user1Id = "user_alice" as ID;
  const user2Id = "user_bob" as ID;
  const user3Id = "user_charlie" as ID;

  let posting1: RoommatePosting; // Will store the main posting used across tests

  await t.step("1. create action", async (t) => {
    await t.step(
      "1.1. effects: should successfully create a posting with valid data",
      async () => {
        const result = await roommatePostingConcept.create({
          poster: user1Id,
          city: "Boston",
          gender: Gender.Female,
          age: 20,
          description: "Looking for a quiet roommate for summer internship",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
        });

        assertEquals("error" in result, false, "Should return posting object");
        posting1 = (result as { posting: RoommatePosting }).posting;

        // Verify properties
        assertObjectMatch(posting1, {
          poster: user1Id,
          city: "Boston",
          gender: Gender.Female,
          age: 20,
          description: "Looking for a quiet roommate for summer internship",
        });

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingById(
          posting1._id,
        );
        assertObjectMatch(fetched!, { _id: posting1._id });
      },
    );

    await t.step(
      "1.2. requires: should fail if user already has a posting",
      async () => {
        // Alice tries to create a second posting
        const result = await roommatePostingConcept.create({
          poster: user1Id,
          city: "Cambridge",
          gender: Gender.Female,
          age: 20,
          description: "Another posting",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
        });

        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("already has"),
          true,
          "Should detect duplicate poster",
        );
      },
    );

    await t.step(
      "1.3. effects: should create a second posting for different user",
      async () => {
        const result = await roommatePostingConcept.create({
          poster: user2Id,
          city: "Cambridge",
          gender: Gender.Male,
          age: 21,
          description: "MIT grad student looking for summer housing",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
        });
        assertEquals("error" in result, false);
        assertObjectMatch((result as { posting: RoommatePosting }).posting, {
          poster: user2Id,
          city: "Cambridge",
        });
      },
    );
  });

  await t.step("2. editCity action", async (t) => {
    await t.step(
      "2.1. effects: should update city for existing poster",
      async () => {
        const result = await roommatePostingConcept.editCity(
          user1Id,
          "San Francisco",
        );
        assertEquals("error" in result, false);
        assertEquals((result as RoommatePosting).city, "San Francisco");

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          user1Id,
        );
        assertEquals(fetched?.city, "San Francisco");
      },
    );

    await t.step(
      "2.2. requires: should fail if poster has no posting",
      async () => {
        const result = await roommatePostingConcept.editCity(
          user3Id, // User with no posting
          "New York",
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  await t.step("3. editGender action", async (t) => {
    await t.step(
      "3.1. effects: should update gender for existing poster",
      async () => {
        const result = await roommatePostingConcept.editGender(
          user1Id,
          Gender.NonBinary,
        );
        assertEquals("error" in result, false);
        assertEquals((result as RoommatePosting).gender, Gender.NonBinary);

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          user1Id,
        );
        assertEquals(fetched?.gender, Gender.NonBinary);
      },
    );

    await t.step(
      "3.2. requires: should fail if poster has no posting",
      async () => {
        const result = await roommatePostingConcept.editGender(
          user3Id,
          Gender.Male,
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  await t.step("4. editAge action", async (t) => {
    await t.step(
      "4.1. effects: should update age for existing poster",
      async () => {
        const result = await roommatePostingConcept.editAge(user1Id, 21);
        assertEquals("error" in result, false);
        assertEquals((result as RoommatePosting).age, 21);

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          user1Id,
        );
        assertEquals(fetched?.age, 21);
      },
    );

    await t.step(
      "4.2. requires: should fail if poster has no posting",
      async () => {
        const result = await roommatePostingConcept.editAge(user3Id, 25);
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  await t.step("5. editDescription action", async (t) => {
    await t.step(
      "5.1. effects: should update description for existing poster",
      async () => {
        const newDescription =
          "Updated: Looking for clean, respectful roommate";
        const result = await roommatePostingConcept.editDescription(
          user1Id,
          newDescription,
        );
        assertEquals("error" in result, false);
        assertEquals((result as RoommatePosting).description, newDescription);

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          user1Id,
        );
        assertEquals(fetched?.description, newDescription);
      },
    );

    await t.step(
      "5.2. requires: should fail if poster has no posting",
      async () => {
        const result = await roommatePostingConcept.editDescription(
          user3Id,
          "Some description",
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  await t.step("6. Query methods", async (t) => {
    await t.step("6.1. getPostingById should return posting", async () => {
      const result = await roommatePostingConcept.getPostingById(posting1._id);
      assertEquals(result !== null, true);
      assertEquals(result?._id, posting1._id);
    });

    await t.step(
      "6.2. getPostingById should return null for non-existent ID",
      async () => {
        const result = await roommatePostingConcept.getPostingById(
          "fake_id" as ID,
        );
        assertEquals(result, null);
      },
    );

    await t.step(
      "6.3. getPostingByPosterId should return posting",
      async () => {
        const result = await roommatePostingConcept.getPostingByPosterId(
          user1Id,
        );
        assertEquals(result !== null, true);
        assertEquals(result?.poster, user1Id);
      },
    );

    await t.step("6.4. getAllPostings should return all postings", async () => {
      const result = await roommatePostingConcept.getAllPostings();
      assertEquals(result.length >= 2, true); // At least Alice and Bob
    });

    await t.step("6.5. getPostingsByCity should filter by city", async () => {
      const result = await roommatePostingConcept.getPostingsByCity(
        "Cambridge",
      );
      // Bob's posting is in Cambridge
      assertEquals(result.length >= 1, true);
      assertEquals(
        result.some((p) => p.poster === user2Id),
        true,
      );
    });
  });

  await t.step("7. delete action", async (t) => {
    await t.step("7.1. effects: should delete the posting", async () => {
      await roommatePostingConcept.delete({ postingId: posting1._id });

      const check = await roommatePostingConcept.getPostingById(posting1._id);
      assertEquals(check, null);
    });

    await t.step(
      "7.2. effects: user can create new posting after deletion",
      async () => {
        // Alice should be able to create a new posting now
        const result = await roommatePostingConcept.create({
          poster: user1Id,
          city: "New York",
          gender: Gender.Female,
          age: 21,
          description: "New posting after deletion",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
        });
        assertEquals("error" in result, false);
        posting1 = (result as { posting: RoommatePosting }).posting;
      },
    );

    await t.step(
      "7.3. requires: operations on deleted posting fail",
      async () => {
        // Delete the posting we just created
        await roommatePostingConcept.delete({ postingId: posting1._id });

        // Try to edit via poster ID (should fail because posting doesn't exist)
        const result = await roommatePostingConcept.editCity(user1Id, "Boston");
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  // Principle Trace: Demonstrates the lifecycle of a user posting, updating preferences, and finding matches
  await t.step(
    "8. Principle Trace: Post -> Update Preferences -> Browse -> Delete",
    async (t) => {
      const traceUser = "traceUser" as ID;
      let tracePosting: RoommatePosting;

      await t.step("8.1. Student posts initial roommate search", async () => {
        const result = await roommatePostingConcept.create({
          poster: traceUser,
          city: "Cambridge",
          gender: Gender.PreferNotToSay,
          age: 22,
          description: "MIT PhD student, looking for summer sublet roommate",
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31"),
        });
        assertEquals("error" in result, false);
        tracePosting = (result as { posting: RoommatePosting }).posting;
      });

      await t.step(
        "8.2. Student updates preferences as plans change",
        async () => {
          // City changed from Cambridge to Boston
          let result = await roommatePostingConcept.editCity(
            traceUser,
            "Boston",
          );
          assertEquals("error" in result, false);
          tracePosting = result as RoommatePosting;

          // Description updated with more details
          result = await roommatePostingConcept.editDescription(
            traceUser,
            "MIT PhD student, looking for summer sublet roommate. Clean, quiet, non-smoking.",
          );
          assertEquals("error" in result, false);
          tracePosting = result as RoommatePosting;

          assertEquals(tracePosting.city, "Boston");
          assertEquals(
            tracePosting.description.includes("non-smoking"),
            true,
          );
        },
      );

      await t.step(
        "8.3. Other students can browse postings by city",
        async () => {
          const bostonPostings = await roommatePostingConcept.getPostingsByCity(
            "Boston",
          );
          assertEquals(
            bostonPostings.some((p) => p.poster === traceUser),
            true,
            "Trace posting should appear in Boston listings",
          );
        },
      );

      await t.step(
        "8.4. Student finds roommate and removes posting",
        async () => {
          await roommatePostingConcept.delete({ postingId: tracePosting._id });

          const check = await roommatePostingConcept.getPostingById(
            tracePosting._id,
          );
          assertEquals(
            check,
            null,
            "Posting should be deleted after finding match",
          );
        },
      );

      await t.step(
        "8.5. Posting no longer appears in city searches",
        async () => {
          const bostonPostings = await roommatePostingConcept.getPostingsByCity(
            "Boston",
          );
          assertEquals(
            bostonPostings.some((p) => p.poster === traceUser),
            false,
            "Deleted posting should not appear in search results",
          );
        },
      );
    },
  );

  await t.step("9. Edge Cases and Multiple Users", async (t) => {
    const userA = "userA" as ID;
    const userB = "userB" as ID;

    await t.step("9.1. Multiple users with different cities", async () => {
      await roommatePostingConcept.create({
        poster: userA,
        city: "San Francisco",
        gender: Gender.Female,
        age: 23,
        description: "Software engineer at startup",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
      });

      await roommatePostingConcept.create({
        poster: userB,
        city: "Seattle",
        gender: Gender.Male,
        age: 24,
        description: "Working at Amazon for summer",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
      });

      const sfPostings = await roommatePostingConcept.getPostingsByCity(
        "San Francisco",
      );
      const seattlePostings = await roommatePostingConcept.getPostingsByCity(
        "Seattle",
      );

      assertEquals(
        sfPostings.some((p) => p.poster === userA),
        true,
      );
      assertEquals(
        seattlePostings.some((p) => p.poster === userB),
        true,
      );
    });

    await t.step("9.2. Users can update all fields independently", async () => {
      // Update all fields for userA
      await roommatePostingConcept.editCity(userA, "Los Angeles");
      await roommatePostingConcept.editGender(userA, Gender.NonBinary);
      await roommatePostingConcept.editAge(userA, 24);
      await roommatePostingConcept.editDescription(
        userA,
        "Updated description",
      );

      const updated = await roommatePostingConcept.getPostingByPosterId(userA);
      assertObjectMatch(updated!, {
        poster: userA,
        city: "Los Angeles",
        gender: Gender.NonBinary,
        age: 24,
        description: "Updated description",
      });
    });
  });

  await t.step("10. editStartDate and editEndDate actions", async (t) => {
    // Create a new posting for testing date edits
    const testUser = "testUser" as ID;
    const createResult = await roommatePostingConcept.create({
      poster: testUser,
      city: "Boston",
      gender: Gender.Female,
      age: 25,
      description: "Test posting for date edits",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
    });
    const testPosting = (createResult as { posting: RoommatePosting }).posting;

    await t.step(
      "10.1. effects: should update startDate for existing poster",
      async () => {
        const newStartDate = new Date("2025-05-15");
        const result = await roommatePostingConcept.editStartDate(
          testUser,
          newStartDate,
        );
        assertEquals("error" in result, false);
        assertEquals(
          (result as RoommatePosting).startDate.getTime(),
          newStartDate.getTime(),
        );

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          testUser,
        );
        assertEquals(
          fetched?.startDate.getTime(),
          newStartDate.getTime(),
        );
      },
    );

    await t.step(
      "10.2. requires: should fail if startDate >= endDate",
      async () => {
        // Try to set startDate to be after endDate
        const invalidStartDate = new Date("2025-09-01");
        const result = await roommatePostingConcept.editStartDate(
          testUser,
          invalidStartDate,
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("Start date must be strictly before end date"),
          true,
        );
      },
    );

    await t.step(
      "10.3. effects: should update endDate for existing poster",
      async () => {
        const newEndDate = new Date("2025-09-15");
        const result = await roommatePostingConcept.editEndDate(
          testUser,
          newEndDate,
        );
        assertEquals("error" in result, false);
        assertEquals(
          (result as RoommatePosting).endDate.getTime(),
          newEndDate.getTime(),
        );

        // Verify persistence
        const fetched = await roommatePostingConcept.getPostingByPosterId(
          testUser,
        );
        assertEquals(
          fetched?.endDate.getTime(),
          newEndDate.getTime(),
        );
      },
    );

    await t.step(
      "10.4. requires: should fail if endDate <= startDate",
      async () => {
        // Try to set endDate to be before startDate
        const invalidEndDate = new Date("2025-04-01");
        const result = await roommatePostingConcept.editEndDate(
          testUser,
          invalidEndDate,
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("End date must be strictly after start date"),
          true,
        );
      },
    );

    await t.step(
      "10.5. requires: should fail if poster has no posting",
      async () => {
        const result = await roommatePostingConcept.editStartDate(
          user3Id,
          new Date("2025-06-01"),
        );
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("No posting found"),
          true,
        );
      },
    );
  });

  await t.step("11. create action date validation", async (t) => {
    const invalidUser = "invalidUser" as ID;

    await t.step(
      "11.1. requires: should fail if startDate >= endDate",
      async () => {
        const result = await roommatePostingConcept.create({
          poster: invalidUser,
          city: "Boston",
          gender: Gender.Female,
          age: 25,
          description: "Invalid dates",
          startDate: new Date("2025-08-31"),
          endDate: new Date("2025-06-01"), // endDate before startDate
        });
        assertEquals("error" in result, true);
        assertEquals(
          (result as { error: string }).error.includes("Start date must be strictly before end date"),
          true,
        );
      },
    );
  });

  // Teardown
  await client.close();
});
