import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserInfoConcept, { Affiliation, Gender } from "./UserInfoConcept.ts";

// Setup mock IDs for users
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
    const updateResult = await userInfoConcept.updateAge({
      user: userA,
      age: 26,
    });
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
    const updateAgeResult = await userInfoConcept.updateAge({
      user: userA,
      age: 30,
    });
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

    // 3. verify the original info is unchanged
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
    await userInfoConcept.updateGender({
      user: userA,
      gender: Gender.PreferNotToSay,
    });
    doc = await userInfoConcept.userInfos.findOne({ user: userA });
    assertEquals(doc?.gender, Gender.PreferNotToSay);
    assertEquals(doc?.affiliation, Affiliation.Faculty);

    // 4. update affiliation
    await userInfoConcept.updateAffiliation({
      user: userA,
      affiliation: Affiliation.Affiliate,
    });
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
    assertEquals(
      docA?.emailAddress,
      "alice.new@university.edu",
      "User A's email should be updated.",
    );
    assertEquals(
      docB?.emailAddress,
      "bob@university.edu",
      "User B's email should not be changed.",
    );

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
