/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Reviewing
  "/api/Reviewing/_getReviewsByItem": "can publicly get reviews for an item",
  "/api/Reviewing/_getReviewsFromUser": "can publicly get a user's reviews",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Sessioning
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",
  "/api/logout",

  // PasswordAuth
  "/api/PasswordAuth/authenticate",
  "/api/PasswordAuth/deleteAccount",
  "/api/PasswordAuth/changePassword",
  "/api/PasswordAuth/_getUsers",
  "/api/PasswordAuth/_getUsername",
  "/api/PasswordAuth/_getUser",

  // SavedItems
  "/api/SavedItems/addUserRecord",
  "/api/SavedItems/deleteUserRecord",
  "/api/SavedItems/addItemTag",
  "/api/SavedItems/removeItemTag",
  "/api/SavedItems/removeItem",
  "/api/SavedItems/_getSavedItems",
  "/api/SavedItems/_getUsersTrackingItem",

  // Reviewing
  "/api/Reviewing/create",
  "/api/Reviewing/deleteReview",
  "/api/Reviewing/editRating",
  "/api/Reviewing/editBlurb",

  // UserInfo
  "/api/UserInfo/setInfo",
  "/api/UserInfo/deleteInfo",
  "/api/UserInfo/updateAge",
  "/api/UserInfo/updateAffiliation",
  "/api/UserInfo/updateGender",
  "/api/UserInfo/updateEmailAddress",
  "/api/UserInfo/_getUserInfo",

  // Listing
  "/api/Listing/create",
  "/api/Listing/delete",
  "/api/Listing/interest",

  // RoommatePosting
  "/api/RoommatePosting/create",
  "/api/RoommatePosting/delete",
  "/api/RoommatePosting/editCity",
  "/api/RoommatePosting/editGender",
  "/api/RoommatePosting/editAge",
  "/api/RoommatePosting/editDescription",
  "/api/RoommatePosting/deletePostingsByPoster",
  "/api/RoommatePosting/contact",
];
