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

  // Listing - edit and query methods
  "/api/Listing/getListing": "internal helper method for passthrough",
  "/api/Listing/isListingConflict": "internal helper method for passthrough",
  "/api/Listing/deletePhoto": "can edit listing photos via passthrough",
  "/api/Listing/addPhoto": "can edit listing photos via passthrough",
  "/api/Listing/editTitle": "can edit listing title via passthrough",
  "/api/Listing/editAddress": "can edit listing address via passthrough",
  "/api/Listing/editStartDate": "can edit listing start date via passthrough",
  "/api/Listing/editEndDate": "can edit listing end date via passthrough",
  "/api/Listing/editPrice": "can edit listing price via passthrough",
  "/api/Listing/addAmenity": "can add listing amenities via passthrough",
  "/api/Listing/deleteAmenity": "can delete listing amenities via passthrough",
  "/api/Listing/getListingById": "can query listing by ID via passthrough",
  "/api/Listing/getAllListings": "can query all listings via passthrough",
  "/api/Listing/_getListingsByLister":
    "can query listings by lister via passthrough",
  "/api/Listing/deleteListingsByLister":
    "can delete listings by lister via passthrough",
  "/api/Listing/_getListerByListingId":
    "can query lister by listing ID via passthrough",

  // RoommatePosting - query methods
  "/api/RoommatePosting/getPostingByPoster":
    "can query posting by poster via passthrough",
  "/api/RoommatePosting/getPostingById":
    "can query posting by ID via passthrough",
  "/api/RoommatePosting/getPostingByPosterId":
    "can query posting by poster ID via passthrough",
  "/api/RoommatePosting/getAllPostings":
    "can query all postings via passthrough",
  "/api/RoommatePosting/getPostingsByCity":
    "can query postings by city via passthrough",
  "/api/RoommatePosting/getPostingsByAge":
    "can query postings by age via passthrough",
  "/api/RoommatePosting/_getPosterByPostingId":
    "can query poster by posting ID via passthrough",
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
