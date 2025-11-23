import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import ReviewingConcept from "./RevieiwngConcept.ts";

// Setup mock IDs for users and items
const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const itemMovie = "item:Movie" as ID;
const itemBook = "item:Book" as ID;

/**
 * Test Case 1
 * Demonstrates the operational principle: a user creates, edits, and then deletes a review.
 */
Deno.test("Test Case 1 - operational principle: full lifecycle of a review", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    // 1. Alice creates a review for a movie.
    const createReviewResult = await reviewingConcept.create({
      user: userAlice,
      item: itemMovie,
      categories: ["Plot", "Acting"],
      stars: [5, 4],
      blurb: "A fantastic movie with a great story.",
    });
    assertNotEquals(
      "error" in createReviewResult,
      true,
      "Review creation should not fail.",
    );
    const { review: reviewId } = createReviewResult as { review: ID };
    assertExists(reviewId);

    // 2. Alice edits the blurb of her review.
    const newBlurb = "An absolutely fantastic movie with a gripping story.";
    const editBlurbResult = await reviewingConcept.editBlurb({
      user: userAlice,
      review: reviewId,
      blurb: newBlurb,
    });
    assertNotEquals(
      "error" in editBlurbResult,
      true,
      "Editing blurb should not fail.",
    );

    // 3. Alice edits a rating in her review.
    const editRatingResult = await reviewingConcept.editRating({
      user: userAlice,
      review: reviewId,
      category: "Acting",
      stars: 5,
    });
    assertNotEquals(
      "error" in editRatingResult,
      true,
      "Editing rating should not fail.",
    );

    // 4. Alice deletes the review.
    const deleteResult = await reviewingConcept.deleteReview({
      user: userAlice,
      review: reviewId,
    });
    assertNotEquals(
      "error" in deleteResult,
      true,
      "Review deletion should not fail.",
    );

    // Verify the review is gone
    const reviews = await reviewingConcept._getReviewsFromUser({
      user: userAlice,
    });
    assertEquals(
      reviews.length,
      0,
      "Alice's review list should be empty after deletion.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 2
 * Demonstrates security and error handling: a user tries to modify or delete another user's review,
 * and tries to create a duplicate review.
 */
Deno.test("Test Case 2 - security and duplication errors", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    // 1. Alice creates a review.
    const createReviewResult = await reviewingConcept.create({
      user: userAlice,
      item: itemMovie,
      categories: ["Story"],
      stars: [4],
      blurb: "Good story.",
    });
    const { review: reviewId } = createReviewResult as { review: ID };

    // 2. Bob tries to edit Alice's review, which should fail.
    const bobEditResult = await reviewingConcept.editBlurb({
      user: userBob,
      review: reviewId,
      blurb: "I disagree!",
    });
    assertEquals(
      "error" in bobEditResult,
      true,
      "A user cannot edit another user's review.",
    );

    // 3. Bob tries to delete Alice's review, which should fail.
    const bobDeleteResult = await reviewingConcept.deleteReview({
      user: userBob,
      review: reviewId,
    });
    assertEquals(
      "error" in bobDeleteResult,
      true,
      "A user cannot delete another user's review.",
    );

    // 4. Alice tries to create a duplicate review for the same item, which should fail.
    const duplicateCreateResult = await reviewingConcept.create({
      user: userAlice,
      item: itemMovie,
      categories: ["Visuals"],
      stars: [5],
      blurb: "This movie looked great.",
    });
    assertEquals(
      "error" in duplicateCreateResult,
      true,
      "Creating a duplicate review for the same item by the same user should fail.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 3
 * Demonstrates that different users can review the same item.
 */
Deno.test("Test Case 3 - multiple users review the same item", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    // 1. Alice reviews a book.
    const aliceReview = await reviewingConcept.create({
      user: userAlice,
      item: itemBook,
      categories: ["Writing"],
      stars: [5],
      blurb: "A modern classic.",
    });
    assertNotEquals(
      "error" in aliceReview,
      true,
      "Alice's review creation should succeed.",
    );

    // 2. Bob reviews the same book.
    const bobReview = await reviewingConcept.create({
      user: userBob,
      item: itemBook,
      categories: ["Pacing"],
      stars: [3],
      blurb: "Started strong but dragged in the middle.",
    });
    assertNotEquals(
      "error" in bobReview,
      true,
      "Bob's review creation for the same item should succeed.",
    );

    // 3. Verify that there are two reviews for the book.
    const bookReviews = await reviewingConcept._getReviewsByItem({
      item: itemBook,
    });
    assertEquals(
      bookReviews.length,
      2,
      "There should be two reviews for the same book from different users.",
    );
  } finally {
    await client.close();
  }
});

/**
 * Test Case 4
 * Demonstrates the functionality of query methods.
 */
Deno.test("Test Case 4 - querying for reviews by item and by user", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    // 1. Create a set of reviews.
    await reviewingConcept.create({
      user: userAlice,
      item: itemMovie,
      categories: ["Fun"],
      stars: [5],
      blurb: "Fun!",
    });
    await reviewingConcept.create({
      user: userAlice,
      item: itemBook,
      categories: ["Prose"],
      stars: [4],
      blurb: "Well-written.",
    });
    await reviewingConcept.create({
      user: userBob,
      item: itemMovie,
      categories: ["Sound"],
      stars: [3],
      blurb: "Audio was muddy.",
    });

    // 2. Query for reviews by item.
    const movieReviews = await reviewingConcept._getReviewsByItem({
      item: itemMovie,
    });
    assertEquals(
      movieReviews.length,
      2,
      "There should be two reviews for the movie.",
    );

    const bookReviews = await reviewingConcept._getReviewsByItem({
      item: itemBook,
    });
    assertEquals(
      bookReviews.length,
      1,
      "There should be one review for the book.",
    );

    // 3. Query for reviews by user.
    const aliceReviews = await reviewingConcept._getReviewsFromUser({
      user: userAlice,
    });
    assertEquals(aliceReviews.length, 2, "Alice should have two reviews.");

    const bobReviews = await reviewingConcept._getReviewsFromUser({
      user: userBob,
    });
    assertEquals(bobReviews.length, 1, "Bob should have one review.");
  } finally {
    await client.close();
  }
});

/**
 * Test Case 5
 * Demonstrates deletion logic by checking that a deleted review and its associated ratings are removed,
 * without affecting other reviews.
 */
Deno.test("Test Case 5 - deletion removes review and ratings correctly", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    // 1. Alice creates a review with multiple ratings.
    const result = await reviewingConcept.create({
      user: userAlice,
      item: itemBook,
      categories: ["Plot", "Characters", "Ending"],
      stars: [5, 5, 2],
      blurb: "Great book, weak ending.",
    });
    const { review: reviewId } = result as { review: ID };

    const initialRatingCount = await db.collection("Reviewing.ratings")
      .countDocuments();
    assertEquals(
      initialRatingCount,
      3,
      "There should be 3 rating documents created.",
    );

    // 2. Alice deletes her review.
    await reviewingConcept.deleteReview({ user: userAlice, review: reviewId });

    // 3. Verify the review is gone.
    const aliceReviews = await reviewingConcept._getReviewsFromUser({
      user: userAlice,
    });
    assertEquals(
      aliceReviews.length,
      0,
      "Alice should have no reviews after deletion.",
    );

    // 4. Verify the associated ratings are also gone.
    const finalRatingCount = await db.collection("Reviewing.ratings")
      .countDocuments();
    assertEquals(
      finalRatingCount,
      0,
      "All associated ratings should be deleted when the review is deleted.",
    );
  } finally {
    await client.close();
  }
});
