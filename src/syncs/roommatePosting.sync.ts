import { actions, Sync } from "@engine";
import { RoommatePosting, Sessioning, Requesting, SavedItems } from "@concepts";

//-- Create RoommatePosting --//
export const CreateRoommatePostingRequest: Sync = ({ request, session, user, city, gender, age, description }) => {
  return {
    when: actions([
      Requesting.request,
      { path: "/RoommatePosting/create", session, city, gender, age, description },
      { request },
    ]),
    where: async (frames) => {
      console.log("CreateRoommatePostingRequest where clause - starting, frames count:", frames.length);
      const result = await frames.query(Sessioning._getUser, { session }, { user });
      console.log("CreateRoommatePostingRequest where clause - frames after query:", result.length, "user bound:", result.length > 0 ? result[0][user] : "no frames");
      // Filter out any frames with errors (invalid session)
      const validFrames = result.filter(frame => {
        const hasError = Object.values(frame).some(val => typeof val === 'object' && val !== null && 'error' in val);
        return !hasError && frame[user] !== undefined;
      });
      console.log("CreateRoommatePostingRequest where clause - valid frames after filtering:", validFrames.length);
      return validFrames;
    },
    then: actions([RoommatePosting.create, {
      poster: user,
      city,
      gender,
      age,
      description
    }]),
  };
};

export const CreateRoommatePostingResponseSuccess: Sync = ({ request, posting }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { posting }],
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const CreateRoommatePostingResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Delete RoommatePosting --//
export const DeleteRoommatePostingRequest: Sync = ({ request, session, user, postingId }) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/delete", session, postingId },
    { request },
  ]),
  where: async (frames) => {
    const result = await frames.query(Sessioning._getUser, { session }, { user });
    return result;
  },
  then: actions([RoommatePosting.delete, { postingId }]),
});

export const DeleteRoommatePostingResponse: Sync = ({ request, postingId }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/delete", postingId }, { request }],
    [RoommatePosting.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "deleted", postingId }]),
});

//-- Remove RoommatePosting from Saved Items when Deleted --//
// This sync triggers AFTER RoommatePosting.delete completes
// It finds ALL users who saved this posting and removes it from their saved items
export const RemoveRoommatePostingFromSavedItems: Sync = ({ postingId, user, userObj, postingIdValue }) => ({
  when: actions([RoommatePosting.delete, { postingId }, {}]),
  where: async (frames) => {
    // Extract postingId value from the frame
    if (frames.length === 0) return frames;
    const idValue = frames[0][postingId] as string;
    if (!idValue) {
      console.warn("RemoveRoommatePostingFromSavedItems: postingId not found in frame", { frames });
      return frames;
    }
    
    // Query for ALL users who have saved this posting
    // Returns { user: { user: User; tags: string[] } }[]
    const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, { item: idValue }, { user: userObj });
    
    // Extract the actual user ID from each result and bind it to the user symbol
    // Also preserve the postingId value for use in the then clause
    return usersFrames
      .map(frame => {
        const userData = frame[userObj] as { user: any; tags: string[] } | undefined;
        if (!userData || !userData.user) {
          return null;
        }
        return {
          ...frame,
          [user]: userData.user,
          [postingIdValue]: idValue
        };
      })
      .filter((frame): frame is typeof frame & { [key: symbol]: any } => frame !== null);
  },
  then: actions([SavedItems.removeItem, { user, item: postingIdValue }]),
});

