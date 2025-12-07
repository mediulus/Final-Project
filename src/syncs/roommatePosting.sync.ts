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
export const CreateRoommatePostingRequest: Sync = ({
  request,
  session,
  user,
  city,
  gender,
  age,
  aboutYourself,
  lookingFor,
  housingStatus,
  startDate,
  endDate,
  dailyRhythm,
  cleanlinessPreference,
  homeEnvironment,
  guestsVisitors,
  numberOfRoommates,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/create",
        session,
        city,
        gender,
        age,
        aboutYourself,
        lookingFor,
        housingStatus,
        startDate,
        endDate,
        dailyRhythm,
        cleanlinessPreference,
        homeEnvironment,
        guestsVisitors,
        numberOfRoommates,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[CreateRoommatePostingRequest] where clause - starting, frames count:",
        frames.length
      );
      console.log(
        "[CreateRoommatePostingRequest] where clause - frame data:",
        frames.length > 0 ? JSON.stringify(frames[0], null, 2) : "no frames"
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "CreateRoommatePostingRequest where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      // Filter out any frames with errors (invalid session)
      const validFrames = result.filter((frame) => {
        const hasError = Object.values(frame).some(
          (val) => typeof val === "object" && val !== null && "error" in val
        );
        return !hasError && frame[user] !== undefined;
      });
      console.log(
        "CreateRoommatePostingRequest where clause - valid frames after filtering:",
        validFrames.length
      );
      return validFrames;
    },
    then: actions([
      RoommatePosting.create,
      {
        poster: user,
        city,
        gender,
        age,
        aboutYourself,
        lookingFor,
        housingStatus,
        startDate,
        endDate,
        dailyRhythm,
        cleanlinessPreference,
        homeEnvironment,
        guestsVisitors,
        numberOfRoommates,
      },
    ]),
  };
};

// Add a console log at the top level to verify the sync is being loaded
console.log("[roommatePosting.sync.ts] CreateRoommatePostingRequest sync loaded");

export const CreateRoommatePostingResponseSuccess: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const CreateRoommatePostingResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/create" }, { request }],
    [RoommatePosting.create, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Delete RoommatePosting --//
export const DeleteRoommatePostingRequest: Sync = ({
  request,
  session,
  user,
  postingId,
  poster,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/delete", session, postingId },
    { request },
  ]),
  where: async (frames) => {
    // Step 1: Get user from session
    const userFrames = await frames.query(
      Sessioning._getUser,
      { session },
      {
        user,
      }
    );

    if (userFrames.length === 0) {
      console.warn("[DeleteRoommatePostingRequest] No valid session found");
      return [];
    }

    // Step 2: Get the poster (creator) of the roommate posting
    const posterFrames = await userFrames.query(
      RoommatePosting._getPosterByPostingId,
      { postingId },
      { poster }
    );

    if (posterFrames.length === 0) {
      console.warn(
        "[DeleteRoommatePostingRequest] Posting not found:",
        postingId
      );
      return [];
    }

    // Step 3: Verify that the user is the creator (poster)
    const userFrame = userFrames[0];
    const posterFrame = posterFrames[0];
    const userId = userFrame[user];
    const posterId = posterFrame[poster];

    if (userId !== posterId) {
      console.warn(
        "[DeleteRoommatePostingRequest] User is not the creator. User:",
        userId,
        "Poster:",
        posterId
      );
      // Return empty frames to prevent deletion
      return [];
    }

    // User is the creator, allow deletion
    return posterFrames;
  },
  then: actions([RoommatePosting.delete, { postingId }]),
});

export const DeleteRoommatePostingResponse: Sync = ({
  request,
  postingId,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/delete", postingId },
      {
        request,
      },
    ],
    [RoommatePosting.delete, {}, {}]
  ),
  then: actions([
    Requesting.respond,
    {
      request,
      status: "deleted",
      postingId,
    },
  ]),
});

//-- Delete RoommatePosting Error Response (when validation fails) --//
// This sync responds with an error when a delete request comes in but validation fails
// It detects this by checking if the request exists but no delete action fired
export const DeleteRoommatePostingResponseError: Sync = ({
  request,
  postingId,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/delete", postingId },
    { request },
  ]),
  where: async (frames) => {
    // Wait a bit to see if delete action fires
    await new Promise((resolve) => setTimeout(resolve, 200));
    // If we reach here, it likely means validation failed and delete didn't fire
    // Return the frames so we can respond with error
    return frames;
  },
  then: actions([
    Requesting.respond,
    {
      request,
      error:
        "You can only delete your own roommate postings or posting not found.",
    },
  ]),
});

//-- Remove RoommatePosting from Saved Items when Deleted --//
// This sync triggers AFTER RoommatePosting.delete completes
// It finds ALL users who saved this posting and removes it from their saved items
export const RemoveRoommatePostingFromSavedItems: Sync = ({
  postingId,
  user,
  userObj,
  postingIdValue,
}) => ({
  when: actions([RoommatePosting.delete, { postingId }, {}]),
  where: async (frames) => {
    // Extract postingId value from the frame
    if (frames.length === 0) return frames;
    const idValue = frames[0][postingId] as string;
    if (!idValue) {
      console.warn(
        "RemoveRoommatePostingFromSavedItems: postingId not found in frame",
        { frames }
      );
      return frames;
    }

    // Query for ALL users who have saved this posting
    // Returns { user: { user: User; tags: string[] } }[]
    const usersFrames = await frames.query(
      SavedItems._getUsersTrackingItem,
      {
        item: idValue,
      },
      { user: userObj }
    );

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
      .filter(
        (frame): frame is typeof frame & { [key: symbol]: any } =>
          frame !== null
      );
  },
  then: actions([SavedItems.removeItem, { user, item: postingIdValue }]),
});

//-- Contact Roommate via Email Notification --//
// This sync allows a user to contact the owner of a roommate posting
export const ContactRoommateRequest: Sync = ({
  request,
  session,
  user,
  postingId,
  poster,
  emailAddress,
  username,
  contactEmail,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/RoommatePosting/contact", session, postingId },
    { request },
  ]),
  where: async (frames) => {
    // Get the logged-in user from session
    const userFrames = await frames.query(
      Sessioning._getUser,
      { session },
      {
        user,
      }
    );

    // Get the poster (owner) of the roommate posting
    const posterFrames = await userFrames.query(
      RoommatePosting._getPosterByPostingId,
      { postingId },
      { poster }
    );

    if (!posterFrames || posterFrames.length === 0) {
      console.warn(
        "⚠️ [ContactRoommateRequest] Posting not found for postingId:",
        postingId
      );
      return posterFrames;
    }

    // Query for poster's email
    const emailFrames = await posterFrames.query(
      UserInfo._getUserEmailAddress,
      { user: poster },
      { emailAddress }
    );

    // Query for poster's username
    const usernameFrames = await emailFrames.query(
      PasswordAuth._getUsername,
      { user: poster },
      { username }
    );

    if (!usernameFrames || usernameFrames.length === 0) {
      console.warn(
        "⚠️ [ContactRoommateRequest] No username frames found for poster:",
        poster
      );
    }

    const contactEmailFrames = await usernameFrames.query(
      UserInfo._getUserEmailAddress,
      { user },      // contacting user
      { emailAddress: contactEmail },
    );

    return contactEmailFrames;
  },
  then: actions([
    Notification.createMessageBody,
    {
      template: ROOMMATE_CONTACT_NOTIFICATION_TEMPLATE,
      email: emailAddress,
      name: username,
      contactEmail,
      subjectOverride: "Someone is interested in your roommate posting!",
    },
  ]),
});

// Send the email after message is created
export const SendContactRoommateEmail: Sync = ({ message }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/contact" }, {}],
    [Notification.createMessageBody, {}, { message }]
  ),
  then: actions([Notification.sendEmail, { message }]),
});

// Tag the posting as 'Contacted' after sending email
export const TagContactedRoommatePosting: Sync = ({
  user,
  postingId,
  session,
}) => ({
  when: actions(
    [
      Requesting.request,
      {
        path: "/RoommatePosting/contact",
        postingId,
        session,
      },
      {},
    ],
    [Notification.sendEmail, {}, {}]
  ),
  where: async (frames) => {
    // Query for the user from the session
    const userFrames = await frames.query(
      Sessioning._getUser,
      { session },
      {
        user,
      }
    );
    console.log(
      "🏷️ [TagContactedRoommatePosting] Attempting to tag posting for user:",
      {
        user: userFrames.length > 0 ? userFrames[0][user] : "no user",
        postingId:
          userFrames.length > 0 ? userFrames[0][postingId] : "no postingId",
      }
    );
    return userFrames;
  },
  then: actions([
    SavedItems.addItemTag,
    {
      user,
      item: postingId,
      tag: "Contacted",
    },
  ]),
});

// Send success response back to frontend
export const ContactRoommateResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/contact" }, { request }],
    [Notification.sendEmail, {}, {}]
  ),
  then: actions([Requesting.respond, { request, status: "contact_sent" }]),
});

//-- Edit RoommatePosting City --//
export const EditRoommatePostingCityRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newCity,
}) => {
  console.log("[EditRoommatePostingCityRequest] Creating sync with:", {
    path: "/RoommatePosting/editCity",
    poster,
    newCity,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editCity",
        session,
        poster,
        newCity,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingCityRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingCityRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editCity,
      {
        poster: user,
        newCity,
      },
    ]),
  };
};

export const EditRoommatePostingCityResponse: Sync = ({ request, posting }) => {
  console.log(
    "[EditRoommatePostingCityResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [Requesting.request, { path: "/RoommatePosting/editCity" }, { request }],
      [RoommatePosting.editCity, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingCityResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingCityResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingCityResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/editCity" }, { request }],
    [RoommatePosting.editCity, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Gender --//
export const EditRoommatePostingGenderRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newGender,
}) => {
  console.log("[EditRoommatePostingGenderRequest] Creating sync with:", {
    path: "/RoommatePosting/editGender",
    poster,
    newGender,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editGender",
        session,
        poster,
        newGender,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingGenderRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingGenderRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editGender,
      {
        poster: user,
        newGender,
      },
    ]),
  };
};

export const EditRoommatePostingGenderResponse: Sync = ({
  request,
  posting,
}) => {
  console.log(
    "[EditRoommatePostingGenderResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [
        Requesting.request,
        { path: "/RoommatePosting/editGender" },
        { request },
      ],
      [RoommatePosting.editGender, {}, { posting }]
    ),
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingGenderResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/editGender" }, { request }],
    [RoommatePosting.editGender, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Age --//
export const EditRoommatePostingAgeRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newAge,
}) => {
  console.log("[EditRoommatePostingAgeRequest] Creating sync with:", {
    path: "/RoommatePosting/editAge",
    poster,
    newAge,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editAge",
        session,
        poster,
        newAge,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingAgeRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingAgeRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editAge,
      {
        poster: user,
        newAge,
      },
    ]),
  };
};

export const EditRoommatePostingAgeResponse: Sync = ({ request, posting }) => {
  console.log(
    "[EditRoommatePostingAgeResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [Requesting.request, { path: "/RoommatePosting/editAge" }, { request }],
      [RoommatePosting.editAge, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingAgeResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingAgeResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingAgeResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/editAge" }, { request }],
    [RoommatePosting.editAge, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting About Yourself --//
export const EditRoommatePostingAboutYourselfRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  console.log("[EditRoommatePostingAboutYourselfRequest] Creating sync with:", {
    path: "/RoommatePosting/editAboutYourself",
    poster,
    newValue:
      typeof newValue === "string"
        ? newValue.substring(0, 50) + "..."
        : newValue,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editAboutYourself",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingAboutYourselfRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingAboutYourselfRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editAboutYourself,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingAboutYourselfResponse: Sync = ({
  request,
  posting,
}) => {
  console.log(
    "[EditRoommatePostingAboutYourselfResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [
        Requesting.request,
        { path: "/RoommatePosting/editAboutYourself" },
        { request },
      ],
      [RoommatePosting.editAboutYourself, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingAboutYourselfResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingAboutYourselfResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingAboutYourselfResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editAboutYourself" },
      { request },
    ],
    [RoommatePosting.editAboutYourself, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Looking For --//
export const EditRoommatePostingLookingForRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  console.log("[EditRoommatePostingLookingForRequest] Creating sync with:", {
    path: "/RoommatePosting/editLookingFor",
    poster,
    newValue:
      typeof newValue === "string"
        ? newValue.substring(0, 50) + "..."
        : newValue,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editLookingFor",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingLookingForRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingLookingForRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editLookingFor,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingLookingForResponse: Sync = ({
  request,
  posting,
}) => {
  console.log(
    "[EditRoommatePostingLookingForResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [
        Requesting.request,
        { path: "/RoommatePosting/editLookingFor" },
        { request },
      ],
      [RoommatePosting.editLookingFor, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingLookingForResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingLookingForResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingLookingForResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editLookingFor" },
      { request },
    ],
    [RoommatePosting.editLookingFor, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting StartDate --//
export const EditRoommatePostingStartDateRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newStartDate,
}) => {
  console.log("[EditRoommatePostingStartDateRequest] Creating sync with:", {
    path: "/RoommatePosting/editStartDate",
    poster,
    newStartDate,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editStartDate",
        session,
        poster,
        newStartDate,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingStartDateRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingStartDateRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editStartDate,
      {
        poster: user,
        newStartDate,
      },
    ]),
  };
};

export const EditRoommatePostingStartDateResponse: Sync = ({
  request,
  posting,
}) => {
  console.log(
    "[EditRoommatePostingStartDateResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [
        Requesting.request,
        { path: "/RoommatePosting/editStartDate" },
        { request },
      ],
      [RoommatePosting.editStartDate, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingStartDateResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingStartDateResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingStartDateResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editStartDate" },
      { request },
    ],
    [RoommatePosting.editStartDate, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting EndDate --//
export const EditRoommatePostingEndDateRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newEndDate,
}) => {
  console.log("[EditRoommatePostingEndDateRequest] Creating sync with:", {
    path: "/RoommatePosting/editEndDate",
    poster,
    newEndDate,
  });
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editEndDate",
        session,
        poster,
        newEndDate,
      },
      { request },
    ]),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingEndDateRequest] where clause - starting, frames count:",
        frames.length
      );
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      console.log(
        "[EditRoommatePostingEndDateRequest] where clause - frames after query:",
        result.length,
        "user bound:",
        result.length > 0 ? result[0][user] : "no frames"
      );
      return result;
    },
    then: actions([
      RoommatePosting.editEndDate,
      {
        poster: user,
        newEndDate,
      },
    ]),
  };
};

export const EditRoommatePostingEndDateResponse: Sync = ({
  request,
  posting,
}) => {
  console.log(
    "[EditRoommatePostingEndDateResponse] Creating sync, waiting for:",
    request,
    posting
  );
  return {
    when: actions(
      [
        Requesting.request,
        { path: "/RoommatePosting/editEndDate" },
        { request },
      ],
      [RoommatePosting.editEndDate, {}, { posting }]
    ),
    where: async (frames) => {
      console.log(
        "[EditRoommatePostingEndDateResponse] where clause - frames count:",
        frames.length
      );
      if (frames.length > 0) {
        console.log(
          "[EditRoommatePostingEndDateResponse] Frame data:",
          "request:",
          frames[0][request],
          "posting:",
          frames[0][posting]
        );
      }
      return frames;
    },
    then: actions([
      Requesting.respond,
      {
        request,
        posting,
      },
    ]),
  };
};

export const EditRoommatePostingEndDateResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [Requesting.request, { path: "/RoommatePosting/editEndDate" }, { request }],
    [RoommatePosting.editEndDate, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Daily Rhythm --//
export const EditRoommatePostingDailyRhythmRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editDailyRhythm",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editDailyRhythm,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingDailyRhythmResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editDailyRhythm" },
      { request },
    ],
    [RoommatePosting.editDailyRhythm, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingDailyRhythmResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editDailyRhythm" },
      { request },
    ],
    [RoommatePosting.editDailyRhythm, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Cleanliness Preference --//
export const EditRoommatePostingCleanlinessPreferenceRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editCleanlinessPreference",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editCleanlinessPreference,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingCleanlinessPreferenceResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editCleanlinessPreference" },
      { request },
    ],
    [RoommatePosting.editCleanlinessPreference, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingCleanlinessPreferenceResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editCleanlinessPreference" },
      { request },
    ],
    [RoommatePosting.editCleanlinessPreference, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Home Environment --//
export const EditRoommatePostingHomeEnvironmentRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editHomeEnvironment",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editHomeEnvironment,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingHomeEnvironmentResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editHomeEnvironment" },
      { request },
    ],
    [RoommatePosting.editHomeEnvironment, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingHomeEnvironmentResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editHomeEnvironment" },
      { request },
    ],
    [RoommatePosting.editHomeEnvironment, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Guests & Visitors --//
export const EditRoommatePostingGuestsVisitorsRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editGuestsVisitors",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editGuestsVisitors,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingGuestsVisitorsResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editGuestsVisitors" },
      { request },
    ],
    [RoommatePosting.editGuestsVisitors, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingGuestsVisitorsResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editGuestsVisitors" },
      { request },
    ],
    [RoommatePosting.editGuestsVisitors, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Number of Roommates --//
export const EditRoommatePostingNumberOfRoommatesRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editNumberOfRoommates",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editNumberOfRoommates,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingNumberOfRoommatesResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editNumberOfRoommates" },
      { request },
    ],
    [RoommatePosting.editNumberOfRoommates, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingNumberOfRoommatesResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editNumberOfRoommates" },
      { request },
    ],
    [RoommatePosting.editNumberOfRoommates, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- Edit RoommatePosting Housing Status --//
export const EditRoommatePostingHousingStatusRequest: Sync = ({
  request,
  session,
  user,
  poster,
  newValue,
}) => {
  return {
    when: actions([
      Requesting.request,
      {
        path: "/RoommatePosting/editHousingStatus",
        session,
        poster,
        newValue,
      },
      { request },
    ]),
    where: async (frames) => {
      const result = await frames.query(
        Sessioning._getUser,
        { session },
        {
          user,
        }
      );
      return result;
    },
    then: actions([
      RoommatePosting.editHousingStatus,
      {
        poster: user,
        newValue,
      },
    ]),
  };
};

export const EditRoommatePostingHousingStatusResponse: Sync = ({
  request,
  posting,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editHousingStatus" },
      { request },
    ],
    [RoommatePosting.editHousingStatus, {}, { posting }]
  ),
  then: actions([Requesting.respond, { request, posting }]),
});

export const EditRoommatePostingHousingStatusResponseError: Sync = ({
  request,
  error,
}) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/RoommatePosting/editHousingStatus" },
      { request },
    ],
    [RoommatePosting.editHousingStatus, {}, { error }]
  ),
  then: actions([Requesting.respond, { request, error }]),
});
