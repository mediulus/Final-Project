import { actions, Frames, Sync } from "@engine";
import { PasswordAuth, Requesting, Sessioning, UserInfo } from "@concepts";

export const SetUserInfoRequest: Sync = ({
  request,
  session,
  user,
  age,
  gender,
  affiliation,
  emailAddress,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserInfo/setInfo",
      session,
      age,
      gender,
      affiliation,
      emailAddress,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserInfo.setInfo, {
    user,
    age,
    gender,
    affiliation,
    emailAddress,
  }]),
});

export const SetUserInfoResponse: Sync = ({ request, userInfo }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/setInfo" }, { request }],
    [UserInfo.setInfo, {}, { userInfo }],
  ),
  then: actions([Requesting.respond, { request, userInfo }]),
});

export const SetUserInfoResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/setInfo" }, { request }],
    [UserInfo.setInfo, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const UpdateUserAgeRequest: Sync = ({
  request,
  session,
  user,
  age,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserInfo/updateAge",
      session,
      age,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserInfo.updateAge, {
    user,
    age,
  }]),
});

export const UpdateUserAgeResponse: Sync = ({ request, userInfo }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateAge" }, { request }],
    [UserInfo.updateAge, {}, { userInfo }],
  ),
  then: actions([Requesting.respond, { request, userInfo }]),
});

export const EditUserAgeResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateAge" }, { request }],
    [UserInfo.updateAge, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const UpdateUserAffiliationRequest: Sync = ({
  request,
  session,
  user,
  affiliation,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserInfo/updateAffiliation",
      session,
      affiliation,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserInfo.updateAffiliation, {
    user,
    affiliation,
  }]),
});

export const UpdateUserAffiliationResponse: Sync = ({ request, userInfo }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateAffiliation" }, { request }],
    [UserInfo.updateAffiliation, {}, { userInfo }],
  ),
  then: actions([Requesting.respond, { request, userInfo }]),
});

export const EditUserAffiliationResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateAffiliation" }, { request }],
    [UserInfo.updateAffiliation, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const UpdateUserGenderRequest: Sync = ({
  request,
  session,
  user,
  gender,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserInfo/updateGender",
      session,
      gender,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserInfo.updateGender, {
    user,
    gender,
  }]),
});

export const UpdateUserGenderResponse: Sync = ({ request, userInfo }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateGender" }, { request }],
    [UserInfo.updateGender, {}, { userInfo }],
  ),
  then: actions([Requesting.respond, { request, userInfo }]),
});

export const EditUserGenderResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateGender" }, { request }],
    [UserInfo.updateGender, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const UpdateUserEmailRequest: Sync = ({
  request,
  session,
  user,
  emailAddress,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserInfo/updateEmailAddress",
      session,
      emailAddress,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([UserInfo.updateEmailAddress, {
    user,
    emailAddress,
  }]),
});

export const UpdateUserEmailResponse: Sync = ({ request, userInfo }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateEmailAddress" }, { request }],
    [UserInfo.updateEmailAddress, {}, { userInfo }],
  ),
  then: actions([Requesting.respond, { request, userInfo }]),
});

export const EditUserEmailResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInfo/updateEmailAddress" }, { request }],
    [UserInfo.updateEmailAddress, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
