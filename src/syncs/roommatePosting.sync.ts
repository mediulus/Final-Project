import { actions, Sync } from "@engine";
import {
  Notification,
  PasswordAuth,
  Requesting,
  RoommatePosting,
  SavedItems,
  Sessioning,
  UserInfo,
} from "@concepts";
import { ROOMMATE_CONTACT_NOTIFICATION_TEMPLATE } from "../concepts/Notification/emailTemplates.ts";

//-- Create RoommatePosting --//
export const CreateRoommatePostingRequest: Sync = (
  { request, session, user, city, gender, age, description },
) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/create",
        session,
        city,
        gender,
        age,
        description,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "CreateRoommatePostingRequest where clause - starting, frames count:",
        frames.length,
      );
      const result = await frames.query(Sessioning._getUser, { session }, {
        user,
      });
      console.log(
        "CreateRoommatePostingRequest where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames",
      );
      // Filter out any frames with errors (invalid session)
      const validFrames = result.filter((frame) => {
        const hasError = Object.values(frame).some((val) =>
          typeof val === "object" && val !== null && "error" in val
        );
        return !hasError && frame[user] !== undefined;
      });
      console.log(
        "CreateRoommatePostingRequest where clause - valid frames after filtering:",
        validFrames.length,
      );
      return validFrames;
    },
    then: actions([RoommatePosting.create, {
      poster: user,
      city,
      gender,
      age,
      description,
    }]),
  };
};

export const CreateRoommatePostingResponseSuccess: Sync = (
  { request, posting },
) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { posting }],
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const CreateRoommatePostingResponseError: Sync = (
  { request, error },
) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Delete RoommatePosting --//
export const DeleteRoommatePostingRequest: Sync = (
  { request, session, user, postingId },
) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/delete", session, postingId },
    { request },
  ]),
  where: async (frames) => {
    const result = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    return result;
  },
  then: actions([RoommatePosting.delete, { postingId }]),
});

export const DeleteRoommatePostingResponse: Sync = (
  { request, postingId },
) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/delete", postingId }, {
      request,
    }],
    [RoommatePosting.delete, {}, {}],
  ),
  then: actions([Requesting.respond, {
    request,
    status: "deleted",
    postingId,
  }]),
});

//-- Remove RoommatePosting from Saved Items when Deleted --//
// This sync triggers AFTER RoommatePosting.delete completes
// It finds ALL users who saved this posting and removes it from their saved items
export const RemoveRoommatePostingFromSavedItems: Sync = (
  { postingId, user, userObj, postingIdValue },
) => ({
  when: actions([RoommatePosting.delete, { postingId }, {}]),
  where: async (frames) => {
    // Extract postingId value from the frame
    if (frames.length === 0) return frames;
    const idValue = frames[0][postingId] as string;
    if (!idValue) {
      console.warn(
        "RemoveRoommatePostingFromSavedItems: postingId not found in frame",
        { frames },
      );
      return frames;
    }

    // Query for ALL users who have saved this posting
    // Returns { user: { user: User; tags: string[] } }[]
    const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, {
      item: idValue,
    }, { user: userObj });

    // Extract the actual user ID from each result and bind it to the user symbol
    // Also preserve the postingId value for use in the then clause
    return usersFrames
      .map((frame) => {
        const userData = frame[userObj] as
          | { user: any; tags: string[] }
          | undefined;
        if (!userData || !userData.user) {
          return null;
        }
        return {
          ...frame,
          [user]: userData.user,
          [postingIdValue]: idValue,
        };
      })
      .filter((frame): frame is typeof frame & { [key: symbol]: any } =>
        frame !== null
      );
  },
  then: actions([SavedItems.removeItem, { user, item: postingIdValue }]),
});

//-- Contact Roommate via Email Notification --//
// This sync allows a user to contact the owner of a roommate posting
export const ContactRoommateRequest: Sync = (
  { request, session, user, postingId, poster, emailAddress, username },
) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/contact", session, postingId },
    { request },
  ]),
  where: async (frames) => {
    // Get the logged-in user from session
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });

    // Get the poster (owner) of the roommate posting
    const posterFrames = await userFrames.query(
      RoommatePosting._getPosterByPostingId,
      { postingId },
      { poster },
    );

    if (!posterFrames || posterFrames.length === 0) {
      console.warn(
        "⚠️ [ContactRoommateRequest] Posting not found for postingId:",
        postingId,
      );
      return posterFrames;
    }

    // Query for poster's email
    const emailFrames = await posterFrames.query(
      UserInfo._getUserEmailAddress,
      { user: poster },
      { emailAddress },
    );

    // Query for poster's username
    const usernameFrames = await emailFrames.query(
      PasswordAuth._getUsername,
      { user: poster },
      { username },
    );

    if (!usernameFrames || usernameFrames.length === 0) {
      console.warn(
        "⚠️ [ContactRoommateRequest] No username frames found for poster:",
        poster,
      );
    }

    return usernameFrames;
  },
  then: actions([
    Notification.createMessageBody,
    {
      template: ROOMMATE_CONTACT_NOTIFICATION_TEMPLATE,
      email: emailAddress,
      name: username,
      subjectOverride: "Someone is interested in your roommate posting!",
    },
  ]),
});

// Send the email after message is created
export const SendContactRoommateEmail: Sync = ({ message }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/contact" }, {}],
    [Notification.createMessageBody, {}, { message }],
  ),
  then: actions([Notification.sendEmail, { message }]),
});

// Send success response back to frontend
export const ContactRoommateResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/contact" }, { request }],
    [Notification.sendEmail, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "contact_sent" }]),
});
