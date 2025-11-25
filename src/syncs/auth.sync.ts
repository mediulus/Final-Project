import { actions, Sync } from "@engine";
import {
  Listing,
  PasswordAuth,
  Requesting,
  RoommatePosting,
  SavedItems,
  Sessioning,
  UserInfo,
  Notification,
} from "@concepts";

import { ACCOUNT_WELCOME_TEMPLATE, ACCOUNT_DELETION_TEMPLATE } from "../concepts/Notification/emailTemplates.ts";

//-- Create Account Request --//
export const CreateAccountRequest: Sync = ({
  request,
  username,
  password,
  age,
  gender,
  affiliation,
  emailAddress,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/createAccount",
      username,
      password,
      age,
      gender,
      affiliation,
      emailAddress,
    },
    { request },
  ]),
  then: actions([
    PasswordAuth.register,
    { username, password },
  ]),
});

//-- After Register: create session, savedItems, and user info --//
export const CreateAccountPostRegister: Sync = ({
  user,
  age,
  gender,
  affiliation,
  emailAddress,
}) => ({
  when: actions(
    [Requesting.request, { path: "/createAccount", age, gender, affiliation, emailAddress }, {}],
    [PasswordAuth.register, {}, { user }],
  ),
  then: actions(
    [Sessioning.create, { user }],
    [SavedItems.addUserRecord, { user }],
    [UserInfo.setInfo, { user, age, gender, affiliation, emailAddress }],
  ),
});

//-- Final Response --//
export const CreateAccountResponseSuccess: Sync = ({
  request,
  user,
  session,
  userInfo,
}) => ({
  when: actions(
    [Requesting.request, { path: "/createAccount" }, { request }],
    [PasswordAuth.register, {}, { user }],
    [Sessioning.create, { user }, { session }],
    [UserInfo.setInfo, { user }, { userInfo }],
  ),
  then: actions([
    Requesting.respond,
    { request, user, session, userInfo },
  ]),
});

//-- Error handling --//
export const CreateAccountResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/createAccount" }, { request }],
    [PasswordAuth.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


///-- Create welcome email message after account creation --//
export const CreateWelcomeEmailMessage: Sync = ({ user, emailAddress, username }) => ({
  when: actions([PasswordAuth.register, {}, { user }]),

  where: async (frames) => {

    // Step 1️⃣: Query for email
    const emailFrames = await frames.query(
      UserInfo._getUserEmailAddress,
      { user },
      { emailAddress },
    );

    // Step 2️⃣: Query for username
    const usernameFrames = await emailFrames.query(
      PasswordAuth._getUsername,
      { user },
      { username },
    );


    if (!usernameFrames || usernameFrames.length === 0) {
      console.warn("⚠️ [CreateWelcomeEmailMessage] No username frames found for user:", user);
    }

    return usernameFrames;
  },

  then: actions([
    Notification.createMessageBody,
    {
      template: ACCOUNT_WELCOME_TEMPLATE,
      email: emailAddress,
      name: username,
      subjectOverride: "Welcome to DamGoodHousing!",
    },
  ]),
});


//-- Send welcome email after account registration --//
export const SendWelcomeEmailAfterRegistration: Sync = ({ message, user }) => ({
  when: actions(
    [PasswordAuth.register, {}, { user }],
    [Notification.createMessageBody, {}, { message }],
  ),
  then: actions([
    Notification.sendEmail,
    { message },
  ]),
});





//-- User Login & Session Creation --//
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([Requesting.request, {
    path: "/PasswordAuth/authenticate",
    username,
    password,
  }, { request }]),
  then: actions([PasswordAuth.authenticate, { username, password }]),
});

export const LoginSuccessCreatesSession: Sync = ({ user }) => ({
  when: actions([PasswordAuth.authenticate, {}, { user }]),
  then: actions([Sessioning.create, { user }]),
});

export const LoginResponseSuccess: Sync = ({ request, user, session }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/authenticate" }, { request }],
    [PasswordAuth.authenticate, {}, { user }],
    [Sessioning.create, { user }, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/authenticate" }, { request }],
    [PasswordAuth.authenticate, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

//-- User Logout --//
export const LogoutRequest: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/logout", session }, {
    request,
  }]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Sessioning.delete, { session }]),
});

export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});

//-- Delete User --//
// export const DeleteAccountRequest: Sync = (
//   { request, session, username, password, user },
// ) => ({
//   when: actions([
//     Requesting.request,
//     { path: "/PasswordAuth/deleteAccount", session, password },
//     { request },
//   ]),
//   // use the session to get user → then get username
//   where: async (frames) => {
//     const userFrames = await frames.query(Sessioning._getUser, { session }, {
//       user,
//     });
//     const usernameFrames = await userFrames.query(PasswordAuth._getUsername, {
//       user,
//     }, { username });
//     return usernameFrames;
//   },
//   then: actions([PasswordAuth.deleteAccount, { username, password }]),
// });


//-- Delete Account Request with email notification --//
export const DeleteAccountRequest: Sync = (
  { request, session, username, password, user, emailAddress }
) => ({
  when: actions([
    Requesting.request,
    { path: "/PasswordAuth/deleteAccount", session, password },
    { request },
  ]),

  // Fetch user, username, and email before deletion
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    const usernameFrames = await userFrames.query(PasswordAuth._getUsername, { user }, { username });
    const emailFrames = await usernameFrames.query(
      UserInfo._getUserEmailAddress,
      { user },
      { emailAddress },
    );
    return emailFrames;
  },

  // Delete the account *and* send the notification email before user info is wiped
  then: actions(
    [PasswordAuth.deleteAccount, { username, password }],
    [Notification.createMessageBody, {
      template: ACCOUNT_DELETION_TEMPLATE,
      email: emailAddress,
      name: username,
      subjectOverride: `Your DamGoodHousing account has been deleted`,
    }],
  ),
});


//-- Send the deletion email after message creation --//
export const SendAccountDeletionEmail: Sync = ({ message, user }) => ({
  when: actions(
    [PasswordAuth.deleteAccount, {}, { user }],
    [Notification.createMessageBody, {}, { message }],
  ),
  then: actions([Notification.sendEmail, { message }]),
});




export const DeleteUserRecordAfterAccountDeletion: Sync = ({ user }) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  then: actions([SavedItems.deleteUserRecord, { user }]),
});

//-- Delete all user's listings when account is deleted --//
export const DeleteUserListingsAfterAccountDeletion: Sync = ({ user }) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  then: actions([Listing.deleteListingsByLister, { lister: user }]),
});

//-- Delete all user's roommate postings when account is deleted --//
export const DeleteUserRoommatePostingsAfterAccountDeletion: Sync = ({ user }) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  then: actions([RoommatePosting.deletePostingsByPoster, { poster: user }]),
});

//-- Remove all deleted listings from saved items after bulk delete --//
// This sync fans out over the deletedListings array and removes each from saved items
export const RemoveDeletedListingsFromSavedItems: Sync = ({ deletedListings, lister, user, userObj, listingIdValue }) => ({
  when: actions([Listing.deleteListingsByLister, { lister }, { deletedListings }]),
  where: async (frames) => {
    // Extract the deletedListings array from the frame
    if (frames.length === 0) {
      console.log("RemoveDeletedListingsFromSavedItems: no frames");
      return [];
    }
    const deletedListingsData = frames[0][deletedListings] as { listingId: any }[] | undefined;
    if (!deletedListingsData || deletedListingsData.length === 0) {
      // No listings to clean up, return empty array
      return [];
    }

    // For each deleted listing, query for users who saved it and create frames
    const allFrames: any[] = [];
    for (const deletedListing of deletedListingsData) {
      const listingIdVal = deletedListing.listingId;
      const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, { item: listingIdVal }, { user: userObj });

      for (const frame of usersFrames) {
        const userData = frame[userObj] as { user: any; tags: string[] } | undefined;
        if (userData && userData.user) {
          allFrames.push({
            ...frame,
            [user]: userData.user,
            [listingIdValue]: listingIdVal
          });
        }
      }
    }

    return allFrames;
  },
  then: actions([SavedItems.removeItem, { user, item: listingIdValue }]),
});

//-- Remove all deleted roommate postings from saved items after bulk delete --//
export const RemoveDeletedRoommatePostingsFromSavedItems: Sync = ({ deletedPostings, poster, user, userObj, postingIdValue }) => ({
  when: actions([RoommatePosting.deletePostingsByPoster, { poster }, { deletedPostings }]),
  where: async (frames) => {
    // Extract the deletedPostings array from the frame
    if (frames.length === 0) {
      console.log("RemoveDeletedRoommatePostingsFromSavedItems: no frames");
      return [];
    }
    const deletedPostingsData = frames[0][deletedPostings] as { postingId: any }[] | undefined;
    if (!deletedPostingsData || deletedPostingsData.length === 0) {
      // No postings to clean up, return empty array
      return [];
    }

    // For each deleted posting, query for users who saved it and create frames
    const allFrames: any[] = [];
    for (const deletedPosting of deletedPostingsData) {
      const postingIdVal = deletedPosting.postingId;
      const usersFrames = await frames.query(SavedItems._getUsersTrackingItem, { item: postingIdVal }, { user: userObj });

      for (const frame of usersFrames) {
        const userData = frame[userObj] as { user: any; tags: string[] } | undefined;
        if (userData && userData.user) {
          allFrames.push({
            ...frame,
            [user]: userData.user,
            [postingIdValue]: postingIdVal
          });
        }
      }
    }

    return allFrames;
  },
  then: actions([SavedItems.removeItem, { user, item: postingIdValue }]),
});

export const DeleteUserInfoAfterAccountDeletion: Sync = ({ user }) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  then: actions([UserInfo.deleteInfo, { user }]),
});

export const DeleteAccountResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/deleteAccount" }, { request }],
    [PasswordAuth.deleteAccount, {}, { user }],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteAccountResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/deleteAccount" }, { request }],
    [PasswordAuth.deleteAccount, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});







//-- Change Password --//
export const ChangePasswordRequest: Sync = (
  { request, username, currentPass, newPass },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PasswordAuth/changePassword", username, currentPass, newPass },
    { request },
  ]),
  then: actions([
    PasswordAuth.changePassword,
    { username, currentPass, newPass },
  ]),
});

export const ChangePasswordResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/changePassword" }, { request }],
    [PasswordAuth.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/PasswordAuth/changePassword" }, { request }],
    [PasswordAuth.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
