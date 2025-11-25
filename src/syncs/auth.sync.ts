import { actions, Sync } from "@engine";
import {
  PasswordAuth,
  Requesting,
  SavedItems,
  Sessioning,
  UserInfo,
} from "@concepts";

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
export const DeleteAccountRequest: Sync = (
  { request, session, username, password, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PasswordAuth/deleteAccount", session, password },
    { request },
  ]),
  // use the session to get user → then get username
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    const usernameFrames = await userFrames.query(PasswordAuth._getUsername, {
      user,
    }, { username });
    return usernameFrames;
  },
  then: actions([PasswordAuth.deleteAccount, { username, password }]),
});

export const DeleteUserRecordAfterAccountDeletion: Sync = ({ user }) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  then: actions([SavedItems.deleteUserRecord, { user }]),
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
