import { actions, Frames, Sync } from "@engine";
import {
  Listing,
  PasswordAuth,
  Requesting,
  Reviewing,
  Sessioning,
} from "@concepts";

export const CreateReviewRequest: Sync = ({
  request,
  session,
  user,
  item,
  categories,
  stars,
  blurb,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Reviewing/create",
      session,
      item,
      categories,
      stars,
      blurb,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([Reviewing.create, { user, item, categories, stars, blurb }]),
});

export const CreateReviewResponse: Sync = ({ request, review }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/create" }, { request }],
    [Reviewing.create, {}, { review }],
  ),
  then: actions([Requesting.respond, { request, review }]),
});

export const CreateReviewResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/create" }, { request }],
    [Reviewing.create, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const EditReviewRatingRequest: Sync = ({
  request,
  session,
  user,
  item,
  category,
  stars,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Reviewing/editRating",
      session,
      item,
      category,
      stars,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([Reviewing.editRating, {
    user,
    item,
    category,
    stars,
  }]),
});

export const EditReviewRatingResponse: Sync = ({ request, review }) => ({
  when: actions(
    [Requesting.request, { path: "Reviewing/editRating" }, { request }],
    [Reviewing.editRating, {}, { review }],
  ),
  then: actions([Requesting.respond, { request, review }]),
});

export const EditReviewRatingResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/editRating" }, { request }],
    [Reviewing.editRating, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const EditReviewBlurbRequest: Sync = ({
  request,
  session,
  user,
  item,
  blurb,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Reviewing/editBlurb",
      session,
      item,
      blurb,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([Reviewing.editBlurb, { user, item, blurb }]),
});

export const EditReviewBlurbResponse: Sync = ({ request, review }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/editBlurb" }, { request }],
    [Reviewing.editBlurb, {}, { review }],
  ),
  then: actions([Requesting.respond, { request, review }]),
});

export const EditReviewBlurbResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/editBlurb" }, { request }],
    [Reviewing.editBlurb, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteReviewRequest: Sync = ({
  request,
  session,
  user,
  review,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Reviewing/deleteReview",
      session,
      review,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    return frames;
  },
  then: actions([Reviewing.deleteReview, {
    user,
    review,
  }]),
});

export const DeleteReviewResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/deleteReview" }, { request }],
    [Reviewing.deleteReview, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteReviewResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/deleteReview" }, { request }],
    [Reviewing.deleteReview, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteUserReviewsAfterAccountDeletion: Sync = (
  { user, review },
) => ({
  when: actions([PasswordAuth.deleteAccount, {}, { user }]),
  where: async (frames) => {
    frames = await frames.query(
      Reviewing._getReviewsFromUser,
      { user },
      {
        review,
      },
    );
    return frames;
  },
  then: actions([Reviewing.deleteReview, { user, review }]),
});

export const DeleteReviewsAfterPostDeletion: Sync = (
  { listing, user, review },
) => ({
  when: actions([Listing.delete, {}, { listing }]),
  where: async (frames) => {
    frames = await frames.query(
      Reviewing._getReviewsByItem,
      { item: listing },
      {
        review,
        user,
      },
    );
    return frames;
  },
  then: actions([Reviewing.deleteReview, { user, review }]),
});
