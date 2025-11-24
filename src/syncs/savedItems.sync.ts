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

export const GetSavedItemsRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/SavedItems/getSavedItems", session },
    { request },
  ]),
  where: (frames) => {
    console.log("🧩 running _getUser for session", session);
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    SavedItems._getSavedItems,
    { user },
  ]),
});

export const GetSavedItemsResponseSuccess: Sync = ({ request, user, items }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/getSavedItems" }, { request }],
    [SavedItems._getSavedItems, { user }, { items }],
  ),
  then: actions([Requesting.respond, { request, items }]),
});

export const GetSavedItemsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/SavedItems/getSavedItems" }, { request }],
    [SavedItems._getSavedItems, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
