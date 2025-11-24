import { assert, assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import SavedItemsConcept from "./SavedItemsConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("SavedItems Concept — requires and effects validation", async () => {
  const [db, client] = await testDb();
  const saved = new SavedItemsConcept(db);

  const userA = "user:alice" as ID;
  const userB = "user:bob" as ID;
  const item1 = "item:book1" as ID;
  const item2 = "item:book2" as ID;

  // 1. Add user records
  const addA = await saved.addUserRecord({ user: userA });
  assert("userRecord" in addA);
  const addB = await saved.addUserRecord({ user: userB });
  assert("userRecord" in addB);

  // 1a. Re-adding same user should fail
  const dupA = await saved.addUserRecord({ user: userA });
  assert("error" in dupA);

  // 2. Add item tags
  const t1 = await saved.addItemTag({ user: userA, item: item1, tag: "wishlist" });
  assert(!("error" in t1));

  const t2 = await saved.addItemTag({ user: userA, item: item1, tag: "fiction" });
  assert(!("error" in t2));

  const t3 = await saved.addItemTag({ user: userB, item: item1, tag: "to-read" });
  assert(!("error" in t3));

  // 2a. Duplicate tag should fail
  const dupTag = await saved.addItemTag({ user: userA, item: item1, tag: "fiction" });
  assert("error" in dupTag);

  // 3. Get saved items for userA
  const itemsA = await saved._getSavedItems({ user: userA });
  assert(Array.isArray(itemsA));
  if (Array.isArray(itemsA)) {
    assertEquals(itemsA.length, 1);
    assertEquals(itemsA[0].item.tags.sort(), ["fiction", "wishlist"]);
  }

  // 4. Remove one tag
  const rmTag = await saved.removeItemTag({ user: userA, item: item1, tag: "fiction" });
  assert(!("error" in rmTag));

  // 4a. Removing non-existent tag should fail
  const rmTag2 = await saved.removeItemTag({ user: userA, item: item1, tag: "nonexistent" });
  assert("error" in rmTag2);

  // 5. Remove last tag (should delete SavedItem entirely)
  const rmTagLast = await saved.removeItemTag({ user: userA, item: item1, tag: "wishlist" });
  assert(!("error" in rmTagLast));

  const afterRemove = await saved._getSavedItems({ user: userA });
  if (Array.isArray(afterRemove)) assertEquals(afterRemove.length, 0);

  // 6. Add another item and tag again
  await saved.addItemTag({ user: userA, item: item2, tag: "favorites" });
  await saved.addItemTag({ user: userB, item: item2, tag: "watchlist" });

  // 7. Get users tracking item2
  const trackers = await saved._getUsersTrackingItem({ item: item2 });
  assertEquals(trackers.length, 2);
  const users = trackers.map((t) => t.user.user).sort();
  assertEquals(users, [userA, userB]);
  console.log("Users tracking item2:", trackers);

  // 8. Delete userB record (should cascade delete saved items)
  const delB = await saved.deleteUserRecord({ user: userB });
  assert(!("error" in delB));

  const trackersAfter = await saved._getUsersTrackingItem({ item: item2 });
  assertEquals(trackersAfter.length, 1);
  assertEquals(trackersAfter[0].user.user, userA);

  await client.close();
});
