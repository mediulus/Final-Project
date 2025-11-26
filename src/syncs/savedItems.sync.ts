import { SavedItems, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";



export const AddItemTagRequest: Sync = ({ request, session, item, user, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/SavedItems/addItemTag", session, item, tag },
    { request },
  ]),
  where: (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    SavedItems.addItemTag,
    { user, item, tag },
  ]),
});

export const AddItemTagResponseSuccess: Sync = ({ request, item }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/addItemTag", item }, { request }],
    [SavedItems.addItemTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request, item }]),
});

export const AddItemTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/addItemTag" }, { request }],
    [SavedItems.addItemTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// removing whole item

export const RemoveItemRequest: Sync = ({ request, session, item, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/SavedItems/removeItem", session, item },
    { request },
  ]),
  where: (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    SavedItems.removeItem,
    { user, item },
  ]),
});


export const RemoveItemResponseSuccess: Sync = ({ request, item }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/removeItem", item }, { request }],
    [SavedItems.removeItem, {}, {}],
  ),
  then: actions([Requesting.respond, { request, item }]),
});

export const RemoveItemResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/removeItem" }, { request }],
    [SavedItems.removeItem, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removing item tag

export const RemoveItemTagRequest: Sync = ({ request, session, item, tag, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/SavedItems/removeItemTag", session, item, tag },
    { request },
  ]),
  where: (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    SavedItems.removeItemTag,
    { user, item, tag },
  ]),
});

export const RemoveItemTagResponseSuccess: Sync = ({ request, item, tag }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/removeItemTag", item, tag }, { request }],
    [SavedItems.removeItemTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request, item, tag }]),
});

export const RemoveItemTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/removeItemTag" }, { request }],
    [SavedItems.removeItemTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// get saved items

export const GetSavedItemsRequest: Sync = ({
  request,
  session,
  user,
  results,
  savedItem,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/SavedItems/_getSavedItems", session },
    { request },
  ]),

  where: async (frames) => {
    console.log("[GetSavedItemsRequest] Starting where clause");
    // 1️⃣ Resolve user from session
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    console.log("[GetSavedItemsRequest] User frames:", userFrames.length);
    
    if (userFrames.length === 0) {
      // No valid session, return empty frames
      console.log("[GetSavedItemsRequest] No valid session, returning empty");
      return [];
    }
    
    // 2️⃣ Query saved items (returns [{ savedItem: {...} }])
    const savedItemsFrames = await userFrames.query(
      SavedItems._getSavedItems,
      { user },
      { savedItem },
    );
    console.log("[GetSavedItemsRequest] Saved items frames:", savedItemsFrames.length);

    // 3️⃣ Collect all savedItem results into an array, grouped by user
    // Group by user (which should be the same for all frames) and collect savedItem
    let collected = savedItemsFrames.collectAs([savedItem], results);
    console.log("[GetSavedItemsRequest] Collected frames:", collected.length);

    // 4️⃣ If no saved items, ensure we still have at least one frame with empty results array
    if (collected.length === 0 && userFrames.length > 0) {
      // Create a frame with empty results array so the response can fire
      const userFrame = userFrames[0];
      collected = [{
        ...userFrame,
        [results]: [],
      }];
      console.log("[GetSavedItemsRequest] Created empty results frame");
    }

    return collected;
  },

  then: actions([
    Requesting.respond,
    { request, results },
  ]),
});
