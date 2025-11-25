import { actions, Sync } from "@engine";
import { Listing, Sessioning, Requesting, SavedItems } from "@concepts";

//-- Create Listing --//
export const CreateListingRequest: Sync = ({ request, session, user, title, amenities, photos, address, startDate, endDate, price }) => {
  return {
    when: actions([
      Requesting.request,
      { path: "/Listing/create", session, title, amenities, photos, address, startDate, endDate, price },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(Sessioning._getUser, { session }, { user });
      return result;
    },
    then: actions([Listing.create, {
      lister: user,
      title,
      amenities,
      photos,
      address,
      startDate,
      endDate,
      price
    }]),
  };
};

export const CreateListingResponseSuccess: Sync = ({ request, listing }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/create" }, { request }],
    [Listing.create, {}, { listing }],
  ),
  then: actions([Requesting.respond, { request, listing }]),
});

export const CreateListingResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/create" }, { request }],
    [Listing.create, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Delete Listing --//
export const DeleteListingRequest: Sync = ({ request, session, user, listingId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Listing/delete", session, listingId },
    { request },
  ]),
  where: async (frames) => {
    const result = await frames.query(Sessioning._getUser, { session }, { user });
    return result;
  },
  then: actions([Listing.delete, { listingId }]),
});

export const DeleteListingResponse: Sync = ({ request, listingId }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/delete", listingId }, { request }],
    [Listing.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "deleted", listingId }]),
});

//-- Remove Listing from Saved Items when Deleted --//
// This sync triggers AFTER Listing.delete completes
// It finds ALL users who saved this listing and removes it from their saved items
export const RemoveListingFromSavedItems: Sync = ({ listingId, user, userObj, listingIdValue }) => ({
  when: actions([Listing.delete, { listingId }, {}]),
  where: async (frames) => {
    // Extract listingId value from the frame
    if (frames.length === 0) return frames;
    const idValue = frames[0][listingId] as string;
    if (!idValue) {
      console.warn("RemoveListingFromSavedItems: listingId not found in frame", { frames });
      return frames;
    }
    
    // Query for ALL users who have saved this listing
    // Returns { user: { user: User; tags: string[] } }[]
    const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, { item: idValue }, { user: userObj });
    
    // Extract the actual user ID from each result and bind it to the user symbol
    // Also preserve the listingId value for use in the then clause
    return usersFrames
      .map(frame => {
        const userData = frame[userObj] as { user: any; tags: string[] } | undefined;
        if (!userData || !userData.user) {
          return null;
        }
        return {
          ...frame,
          [user]: userData.user,
          [listingIdValue]: idValue
        };
      })
      .filter((frame): frame is typeof frame & { [key: symbol]: any } => frame !== null);
  },
  then: actions([SavedItems.removeItem, { user, item: listingIdValue }]),
});