# UserInfo Prompts

#prompt:

Using the exact Deno style of the tests found here:

import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import WishlistConcept from "./WishlistConcept.ts";

const creatorA = "creator:Alice" as ID;
const creatorB = "creator:Bob" as ID;
const nonPlace = "place:nonPlace" as ID;

/**
 * Test Case 1
 * Demonstrates operational principle: user adds and then removes places from their wishlist.
 */
Deno.test("Test Case 1 - operational principle: user adds and then removes places from their wishlist", async () => {
  const [db, client] = await testDb();
  const wishlistConcept = new WishlistConcept(db);

  try {
    // 1. user adds places
    const makeAthens = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Athens",
      region: "Attica",
      country: "Greece",
    });
    assertNotEquals(
      "error" in makeAthens,
      true,
      "Place addition should not fail.",
    );
    const { place: athens } = makeAthens as { place: ID };
    assertExists(athens);

    const makeTokyo = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });
    assertNotEquals(
      "error" in makeTokyo,
      true,
      "Place addition should not fail.",
    );
    const { place: tokyo } = makeTokyo as { place: ID };
    assertExists(tokyo);

    const makeNyc = await wishlistConcept.addPlace({
      user: creatorA,
      city: "New York City",
      region: "New York",
      country: "United States",
    });
    assertNotEquals(
      "error" in makeNyc,
      true,
      "Place addition should not fail.",
    );

    const { place: nyc } = makeNyc as { place: ID };
    assertExists(nyc);

    const places = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(places.length, 3, "Wishlist should have 3 places.");

    // 2. user removes places
    const removeAthens = await wishlistConcept.removePlace({
      user: creatorA,
      place: athens,
    });
    assertNotEquals(
      "error" in removeAthens,
      true,
      "Place deletion should not fail.",
    );
    const removeNyc = wishlistConcept.removePlace({
      user: creatorA,
      place: nyc,
    });
    assertNotEquals(
      "error" in removeNyc,
      true,
      "Place deletion should not fail.",
    );

    const newPlaces = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(newPlaces.length, 1, "Wishlist should have 1 place.");
  } finally {
    await client.close();
  }
});

/**
 * Test Case 2
 * Demonstrates user tries to remove place that was never added;
 * user tries to remove another user's place.
 */
Deno.test("Test Case 2 - user removes unadded place, another user's place", async () => {
  const [db, client] = await testDb();
  const wishlistConcept = new WishlistConcept(db);

  try {
    // 1. user A tries to remove place that was never added
    const removePlace1 = await wishlistConcept.removePlace({
      user: creatorA,
      place: nonPlace,
    });
    assertEquals(
      "error" in removePlace1,
      true,
      "Removing nonexistant place should fail.",
    );

    // 2. user A adds place
    const makeTokyo = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });

    const { place: tokyo } = makeTokyo as { place: ID };

    // 3. user B tries to remove place
    const removePlace2 = await wishlistConcept.removePlace({
      user: creatorB,
      place: tokyo,
    });
    assertEquals(
      "error" in removePlace2,
      true,
      "Removing another user's place should fail.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 3
 * Demonstrates user adds duplicate place, another user adds same place.
 */
Deno.test("Test Case 2 - duplicate places for same and different user", async () => {
  const [db, client] = await testDb();
  const wishlistConcept = new WishlistConcept(db);

  try {
    // 1. user A adds place
    await wishlistConcept.addPlace({
      user: creatorA,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });

    // 2. user A adds same place
    const makeTokyo2 = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });

    assertEquals(
      "error" in makeTokyo2,
      true,
      "Adding duplicate place for same user should fail.",
    );

    // 3. user B adds same place
    const makeTokyo3 = await wishlistConcept.addPlace({
      user: creatorB,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });

    assertNotEquals(
      "error" in makeTokyo3,
      true,
      "Adding duplicate place for different user shouldn't fail.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 4
 * Demonstrates multiple users add and remove places.
 */
Deno.test("Test Case 4 - multiple users", async () => {
  const [db, client] = await testDb();
  const wishlistConcept = new WishlistConcept(db);

  try {
    const places0 = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(places0, [], "User A's wishlist should have 0 places.");

    // 1. user A adds place
    await wishlistConcept.addPlace({
      user: creatorA,
      city: "Tokyo",
      region: "Kanto",
      country: "Japan",
    });

    // 2. user B adds place
    const makeChicago = await wishlistConcept.addPlace({
      user: creatorB,
      city: "Chicago",
      region: "Illinois",
      country: "United States",
    });

    const { place: chicago } = makeChicago as { place: ID };

    // 3. user A adds place
    const makeMiami = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Miami",
      region: "Florida",
      country: "United States",
    });

    const { place: miami } = makeMiami as { place: ID };

    let placesA = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(placesA.length, 2, "User A's wishlist should have 2 places.");

    // 4. user A removes place
    await wishlistConcept.removePlace({
      user: creatorA,
      place: miami,
    });

    placesA = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(placesA.length, 1, "User A's wishlist should have 1 place.");

    // 5. user A adds place
    const makeGreensboro = await wishlistConcept.addPlace({
      user: creatorA,
      city: "Greensboro",
      region: "North Carolina",
      country: "United States",
    });

    const { place: greensboro } = makeGreensboro as { place: ID };

    placesA = await wishlistConcept._getPlaces({ user: creatorA });
    assertEquals(placesA.length, 2, "User A's wishlist should have 2 places.");

    // 6. user B removes place
    await wishlistConcept.removePlace({
      user: creatorB,
      place: chicago,
    });

    placesA = await wishlistConcept._getPlaces({ user: creatorB });
    assertEquals(placesA.length, 0, "User B's wishlist should have 0 places.");
  } finally {
    await client.close();
  }
});


Write 5 separate tests for the User Info concept (below) that test all actions/queries of the reviewing concept, along with edge cases.

User Info concept:

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInfo" + ".";

// Generic types for the concept's external dependencies
type User = ID;

// Internal entity types, represented as IDs
type UserInfo = ID;

enum Gender {
  Female,
  Male,
  NonBinary,
  PreferNotToSay,
}
enum Affiliation {
  Undergraduate,
  Graduate,
  Faculty,
  Affiliate,
}

/**
 * State: A set of UserInfos with a user, age, gender, affiliation, and email address.
 */
export interface UserInfoDoc {
  _id: UserInfo;
  user: User;
  age: number;
  gender: Gender;
  affiliation: Affiliation;
  emailAddress: string;
}

/**
 * @concept UserInfo
 * @purpose to keep track of a user’s personal information
 */
export default class UserInfoConcept {
  userInfos: Collection<UserInfoDoc>;

  constructor(private readonly db: Db) {
    this.userInfos = this.db.collection(PREFIX + "userInfos");
  }

  /**
   * Action: Adds a new user and their info.
   * @requires a userInfo with user doesn’t exist in set of userInfos
   * @effects creates and returns a new userInfo with user, emailAddress, gender, age, and affiliation
   */
  async setInfo(
    { user, age, gender, affiliation, emailAddress }: {
      user: User;
      age: number;
      gender: Gender;
      affiliation: Affiliation;
      emailAddress: string;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo doesn't already exist for user
    const existingUser = await this.userInfos.findOne({
      user,
    });

    if (existingUser) {
      return {
        error: `UserInfo already exists for user with ID ${user}.`,
      };
    }

    // adds userInfo
    const newUserInfoId = freshID() as UserInfo;

    await this.userInfos.insertOne({
      _id: newUserInfoId,
      user,
      age,
      gender,
      affiliation,
      emailAddress,
    });

    return { userInfo: newUserInfoId };
  }

  /**
   * Action: Removes a user and their info.
   * @requires userInfo with user exists in set of userInfos
   * @effects removes user's userInfo from set of userInfos
   */
  async deleteInfo(
    { user }: {
      user: User;
    },
  ): Promise<Empty | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // removes userInfo
    await this.userInfos.deleteOne({ user: user });
    return {};
  }

  /**
   * Action: Updates a user's age.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates age of user's userInfo to given age and returns userInfo
   */
  async updateAge(
    { user, age }: {
      user: User;
      age: number;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update age
    await this.userInfos.updateOne({ user: user }, { $set: { age: age } });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's gender.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates gender of user's userInfo to given gender and returns userInfo
   */
  async updateGender(
    { user, gender }: {
      user: User;
      gender: Gender;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update gender
    await this.userInfos.updateOne({ user: user }, {
      $set: { gender: gender },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's affiliation.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates affiliation of user's userInfo to given affiliation and returns userInfo
   */
  async updateAffiliation(
    { user, affiliation }: {
      user: User;
      affiliation: Affiliation;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update affiliation
    await this.userInfos.updateOne({ user: user }, {
      $set: { affiliation: affiliation },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's email address.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates email address of user's userInfo to given email address and returns userInfo
   */
  async updateEmailAddress(
    { user, emailAddress }: {
      user: User;
      emailAddress: string;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update email address
    await this.userInfos.updateOne({ user: user }, {
      $set: { emailAddress: emailAddress },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }
}

# response:

Here are 5 Deno-style tests for the `UserInfoConcept`, written in the requested style.

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserInfoConcept, { Affiliation, Gender } from "./UserInfoConcept.ts";

const userA = "user:Alice" as ID;
const userB = "user:Bob" as ID;

/**
 * Test Case 1
 * Demonstrates operational principle: user sets info, updates it, and then deletes it.
 */
Deno.test("Test Case 1 - operational principle: set, update, and delete info", async () => {
  const [db, client] = await testDb();
  const userInfoConcept = new UserInfoConcept(db);

  try {
    // 1. user sets their info
    const setResult = await userInfoConcept.setInfo({
      user: userA,
      age: 25,
      gender: Gender.Female,
      affiliation: Affiliation.Graduate,
      emailAddress: "alice@example.com",
    });
    assertNotEquals(
      "error" in setResult,
      true,
      "Setting user info should not fail.",
    );
    const { userInfo } = setResult as { userInfo: ID };
    assertExists(userInfo);

    let infoDoc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertExists(infoDoc, "User info document should exist.");
    assertEquals(infoDoc.age, 25);

    // 2. user updates their age
    const updateResult = await userInfoConcept.updateAge({ user: userA, age: 26 });
    assertNotEquals(
      "error" in updateResult,
      true,
      "Updating age should not fail.",
    );

    infoDoc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(infoDoc?.age, 26, "Age should be updated to 26.");

    // 3. user deletes their info
    const deleteResult = await userInfoConcept.deleteInfo({ user: userA });
    assertNotEquals(
      "error" in deleteResult,
      true,
      "Deleting user info should not fail.",
    );

    const finalDoc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(finalDoc, null, "User info document should be deleted.");
  } finally {
    await client.close();
  }
});

/**
 * Test Case 2
 * Demonstrates error handling when trying to update or delete a non-existent user.
 */
Deno.test("Test Case 2 - error handling for non-existent user", async () => {
  const [db, client] = await testDb();
  const userInfoConcept = new UserInfoConcept(db);

  try {
    // 1. try to update age for a user that doesn't exist
    const updateAgeResult = await userInfoConcept.updateAge({ user: userA, age: 30 });
    assertEquals(
      "error" in updateAgeResult,
      true,
      "Updating age for non-existent user should fail.",
    );

    // 2. try to update affiliation for a user that doesn't exist
    const updateAffiliationResult = await userInfoConcept.updateAffiliation({
      user: userA,
      affiliation: Affiliation.Faculty,
    });
    assertEquals(
      "error" in updateAffiliationResult,
      true,
      "Updating affiliation for non-existent user should fail.",
    );

    // 3. try to delete info for a user that doesn't exist
    const deleteResult = await userInfoConcept.deleteInfo({ user: userA });
    assertEquals(
      "error" in deleteResult,
      true,
      "Deleting info for non-existent user should fail.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 3
 * Demonstrates that a user cannot set their info more than once.
 */
Deno.test("Test Case 3 - creating duplicate user info", async () => {
  const [db, client] = await testDb();
  const userInfoConcept = new UserInfoConcept(db);

  try {
    // 1. user A sets their info
    await userInfoConcept.setInfo({
      user: userA,
      age: 21,
      gender: Gender.NonBinary,
      affiliation: Affiliation.Undergraduate,
      emailAddress: "a@example.com",
    });

    // 2. user A tries to set their info again
    const duplicateSetResult = await userInfoConcept.setInfo({
      user: userA,
      age: 22,
      gender: Gender.Male,
      affiliation: Affiliation.Graduate,
      emailAddress: "a.new@example.com",
    });

    assertEquals(
      "error" in duplicateSetResult,
      true,
      "Setting info for an existing user should fail.",
    );

    // 3. Verify the original info is unchanged
    const infoDoc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(infoDoc?.age, 21, "Original age should not be changed.");
    assertEquals(
      infoDoc?.emailAddress,
      "a@example.com",
      "Original email should not be changed.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 4
 * Demonstrates comprehensive updates to all fields of a user's info.
 */
Deno.test("Test Case 4 - comprehensive field updates", async () => {
  const [db, client] = await testDb();
  const userInfoConcept = new UserInfoConcept(db);

  try {
    // 1. user sets their initial info
    await userInfoConcept.setInfo({
      user: userA,
      age: 40,
      gender: Gender.Male,
      affiliation: Affiliation.Faculty,
      emailAddress: "professor.a@example.edu",
    });

    // 2. update age
    await userInfoConcept.updateAge({ user: userA, age: 41 });
    let doc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(doc?.age, 41);
    assertEquals(doc?.gender, Gender.Male);

    // 3. update gender
    await userInfoConcept.updateGender({ user: userA, gender: Gender.PreferNotToSay });
    doc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(doc?.gender, Gender.PreferNotToSay);
    assertEquals(doc?.affiliation, Affiliation.Faculty);

    // 4. update affiliation
    await userInfoConcept.updateAffiliation({ user: userA, affiliation: Affiliation.Affiliate });
    doc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(doc?.affiliation, Affiliation.Affiliate);
    assertEquals(doc?.emailAddress, "professor.a@example.edu");

    // 5. update email address
    await userInfoConcept.updateEmailAddress({
      user: userA,
      emailAddress: "visiting.a@example.edu",
    });
    doc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(doc?.emailAddress, "visiting.a@example.edu");
    assertEquals(doc?.age, 41);
  } finally {
    await client.close();
  }
});

/**
 * Test Case 5
 * Demonstrates multiple users setting, updating, and deleting their info independently.
 */
Deno.test("Test Case 5 - multiple users interaction", async () => {
  const [db, client] = await testDb();
  const userInfoConcept = new UserInfoConcept(db);

  try {
    // 1. user A sets info
    await userInfoConcept.setInfo({
      user: userA,
      age: 20,
      gender: Gender.Female,
      affiliation: Affiliation.Undergraduate,
      emailAddress: "alice@university.edu",
    });

    // 2. user B sets info
    await userInfoConcept.setInfo({
      user: userB,
      age: 28,
      gender: Gender.Male,
      affiliation: Affiliation.Graduate,
      emailAddress: "bob@university.edu",
    });

    const count1 = await userInfoConcept.userInfos.countDocuments();
    assertEquals(count1, 2, "There should be two user info documents.");

    // 3. user A updates their email address
    await userInfoConcept.updateEmailAddress({
      user: userA,
      emailAddress: "alice.new@university.edu",
    });

    const docA = await userInfoConcept.userInfos.findOne({ user: userA });
    const docB = await userInfoConcept.userInfos.findOne({ user: userB });
    assertEquals(docA?.emailAddress, "alice.new@university.edu", "User A's email should be updated.");
    assertEquals(docB?.emailAddress, "bob@university.edu", "User B's email should not be changed.");

    // 4. user B deletes their info
    const deleteResult = await userInfoConcept.deleteInfo({ user: userB });
    assertNotEquals("error" in deleteResult, true);

    const count2 = await userInfoConcept.userInfos.countDocuments();
    assertEquals(count2, 1, "There should be one user info document left.");

    const finalDocA = await userInfoConcept.userInfos.findOne({ user: userA });
    const finalDocB = await userInfoConcept.userInfos.findOne({ user: userB });
    assertExists(finalDocA, "User A's info should still exist.");
    assertEquals(finalDocB, null, "User B's info should be deleted.");
  } finally {
    await client.close();
  }
});
```