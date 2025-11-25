import { actions, Frames, Sync } from "@engine";
import {
  Listing,
  Notification,
  PasswordAuth,
  Requesting,
  SavedItems,
  Sessioning,
  UserInfo,
} from "@concepts";

import {
  HOUSING_CONTACT_NOTIFICATION_TEMPLATE,
  SAVED_POST_UPDATE_TEMPLATE,
} from "../concepts/Notification/emailTemplates.ts";

//-- Create Listing --//
export const CreateListingRequest: Sync = (
  {
    request,
    session,
    user,
    title,
    amenities,
    photos,
    address,
    startDate,
    endDate,
    price,
  },
) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/Listing/create",
        session,
        title,
        amenities,
        photos,
        address,
        startDate,
        endDate,
        price,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(Sessioning._getUser, { session }, {
        user,
      });
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
      price,
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
export const DeleteListingRequest: Sync = (
  { request, session, user, listingId },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Listing/delete", session, listingId },
    { request },
  ]),
  where: async (frames) => {
    const result = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    return result;
  },
  then: actions([Listing.delete, { listingId }]),
});

export const DeleteListingResponse: Sync = ({ request, listingId }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/delete", listingId }, { request }],
    [Listing.delete, {}, {}],
  ),
  then: actions([Requesting.respond, {
    request,
    status: "deleted",
    listingId,
  }]),
});

//-- Remove Listing from Saved Items when Deleted --//
// This sync triggers AFTER Listing.delete completes
// It finds ALL users who saved this listing and removes it from their saved items
export const RemoveListingFromSavedItems: Sync = (
  { listingId, user, userObj, listingIdValue },
) => ({
  when: actions([Listing.delete, { listingId }, {}]),
  where: async (frames) => {
    // Extract listingId value from the frame
    if (frames.length === 0) return frames;
    const idValue = frames[0][listingId] as string;
    if (!idValue) {
      console.warn(
        "RemoveListingFromSavedItems: listingId not found in frame",
        { frames },
      );
      return frames;
    }

    // Query for ALL users who have saved this listing
    // Returns { user: { user: User; tags: string[] } }[]
    const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, {
      item: idValue,
    }, { user: userObj });

    // Extract the actual user ID from each result and bind it to the user symbol
    // Also preserve the listingId value for use in the then clause
    const mapped = usersFrames
      .map((frame) => {
        const userData = frame[userObj] as
          | { user: unknown; tags: string[] }
          | undefined;
        if (!userData || !userData.user) {
          return null;
        }
        return {
          ...frame,
          [user]: userData.user,
          [listingIdValue]: idValue,
        } as unknown as Record<symbol, unknown>;
      })
      .filter((frame): frame is Record<symbol, unknown> => frame !== null);

    return new Frames(...(mapped as unknown as Record<symbol, unknown>[]));
  },
  then: actions([SavedItems.removeItem, { user, item: listingIdValue }]),
});

//-- Create saved-post-update message for users whose saved item was removed --//
export const CreateSavedPostUpdateMessage: Sync = (
  { user, item, emailAddress, username },
) => ({
  when: actions([SavedItems.removeItem, {}, { user, item }]),

  where: async (frames) => {
    // Query for email
    const emailFrames = await frames.query(
      UserInfo._getUserEmailAddress,
      { user },
      { emailAddress },
    );

    // Query for username
    const usernameFrames = await emailFrames.query(
      PasswordAuth._getUsername,
      { user },
      { username },
    );

    if (!usernameFrames || usernameFrames.length === 0) {
      console.warn(
        "⚠️ [CreateSavedPostUpdateMessage] No username frames found for user:",
        user,
      );
    }

    return usernameFrames;
  },

  then: actions([
    Notification.createMessageBody,
    {
      template: SAVED_POST_UPDATE_TEMPLATE,
      email: emailAddress,
      name: username,
      subjectOverride: "A saved listing was removed",
      // include the listing id in the template bindings
      listingId: item,
    },
  ]),
});

//-- Send the saved-post-update email after message creation --//
export const SendSavedPostUpdateEmail: Sync = ({ message, user }) => ({
  when: actions(
    [SavedItems.removeItem, {}, { user }],
    [Notification.createMessageBody, {}, { message }],
  ),
  then: actions([Notification.sendEmail, { message }]),
});

//-- Express Interest in Listing via Email Notification --//
// This sync allows a user to express interest in a listing and notify the owner
export const ExpressListingInterestRequest: Sync = (
  { request, session, user, listingId, lister, emailAddress, username },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Listing/interest", session, listingId },
    { request },
  ]),
  where: async (frames) => {
    // Get the logged-in user from session
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });

    // Get the lister (owner) of the listing
    const listerFrames = await userFrames.query(
      Listing._getListerByListingId,
      { listingId },
      { lister },
    );

    if (!listerFrames || listerFrames.length === 0) {
      console.warn(
        "⚠️ [ExpressListingInterestRequest] Listing not found for listingId:",
        listingId,
      );
      return listerFrames;
    }

    // Query for lister's email
    const emailFrames = await listerFrames.query(
      UserInfo._getUserEmailAddress,
      { user: lister },
      { emailAddress },
    );

    // Query for lister's username
    const usernameFrames = await emailFrames.query(
      PasswordAuth._getUsername,
      { user: lister },
      { username },
    );

    if (!usernameFrames || usernameFrames.length === 0) {
      console.warn(
        "⚠️ [ExpressListingInterestRequest] No username frames found for lister:",
        lister,
      );
    }

    return usernameFrames;
  },
  then: actions([
    Notification.createMessageBody,
    {
      template: HOUSING_CONTACT_NOTIFICATION_TEMPLATE,
      email: emailAddress,
      name: username,
      subjectOverride: "Someone is interested in your housing listing!",
    },
  ]),
});

// Send the email after message is created
export const SendListingInterestEmail: Sync = ({ message }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/interest" }, {}],
    [Notification.createMessageBody, {}, { message }],
  ),
  then: actions([Notification.sendEmail, { message }]),
});

// Tag the listing as 'Contacted' after sending email
export const TagContactedListing: Sync = ({ user, listingId, session }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/interest", listingId, session }, {}],
    [Notification.sendEmail, {}, {}],
  ),
  where: async (frames) => {
    // Query for the user from the session
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    console.log(
      "🏷️ [TagContactedListing] Attempting to tag listing for user:",
      {
        user: userFrames.length > 0 ? userFrames[0][user] : "no user",
        listingId: userFrames.length > 0
          ? userFrames[0][listingId]
          : "no listingId",
      },
    );
    return userFrames;
  },
  then: actions([SavedItems.addItemTag, {
    user,
    item: listingId,
    tag: "Contacted",
  }]),
});

// Send success response back to frontend
export const ListingInterestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Listing/interest" }, { request }],
    [Notification.sendEmail, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "interest_sent" }]),
});
