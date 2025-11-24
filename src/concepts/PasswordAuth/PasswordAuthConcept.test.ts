import { assert, assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import PasswordAuthConcept from "./PasswordAuthConcept.ts";

Deno.test("PasswordAuth Concept — requires and effects validation", async () => {
  const [db, client] = await testDb();
  const auth = new PasswordAuthConcept(db);

  // 1. Register new user
  const reg = await auth.register({ username: "alice", password: "secret" });
  console.log("register →", reg);
  if ("error" in reg) throw new Error("Registration failed unexpectedly");
  const userId = reg.user;
  assert(typeof userId === "string");

  // 1a. Duplicate username
  const dup = await auth.register({ username: "alice", password: "other" });
  console.log("duplicate register →", dup);
  assert("error" in dup, "should return an error for duplicate username");

  // 2. Authenticate correctly
  const authGood = await auth.authenticate({ username: "alice", password: "secret" });
  console.log("authenticate (correct) →", authGood);
  assertEquals("user" in authGood, true);
  if ("user" in authGood) assertEquals(authGood.user, userId);

  // 3. Authenticate with wrong password
  const authBad = await auth.authenticate({ username: "alice", password: "wrong" });
  console.log("authenticate (wrong) →", authBad);
  assert("error" in authBad);

  // 4. Change password
  const change = await auth.changePassword({
    username: "alice",
    currentPass: "secret",
    newPass: "newsecret",
  });
  console.log("changePassword →", change);
  assert(!("error" in change));

  // 5. Authenticate with old password (fail)
  const oldAuth = await auth.authenticate({ username: "alice", password: "secret" });
  console.log("authenticate (old password) →", oldAuth);
  assert("error" in oldAuth);

  // 6. Authenticate with new password (succeed)
  const newAuth = await auth.authenticate({ username: "alice", password: "newsecret" });
  console.log("authenticate (new password) →", newAuth);
  assert("user" in newAuth && newAuth.user === userId);

  // 7. Delete account
  const del = await auth.deleteAccount({ username: "alice", password: "newsecret" });
  console.log("deleteAccount →", del);
  assert(!("error" in del));

  // 8. Authenticate after deletion (fail)
  const afterDel = await auth.authenticate({ username: "alice", password: "newsecret" });
  console.log("authenticate (after delete) →", afterDel);
  assert("error" in afterDel);

  await client.close();
});
