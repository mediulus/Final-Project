import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Reviewing" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity types, represented as IDs
type Review = ID;
type Rating = ID;

/**
 * State:
 * A set of Reviews with a user, item, set of ratings, and blurb.
 * A set of Ratings with a review, category, and stars.
 */
export interface ReviewDoc {
  _id: Review;
  user: User;
  item: Item;
  ratings: Rating[];
  blurb: string;
}

export interface RatingDoc {
  _id: Rating;
  review: Review;
  category: string;
  stars: number;
}

/**
 * @concept Reviewing
 * @purpose to allow users to indicate their opinions about items
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;
  ratings: Collection<RatingDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
    this.ratings = this.db.collection(PREFIX + "ratings");
  }

  /**
   * Action: Creates a new review.
   * @requires a review for the user and item doesn’t exist in the set of reviews; all categories in the set of categories are uniqu
   * @effects creates ratings from the corresponding categories and stars, and then creates and returns a review associated with the user, item, ratings, and blurb
   */
  async create(
    {
      user,
      item,
      categories,
      stars,
      blurb,
    }: {
      user: User;
      item: Item;
      categories: string[];
      stars: number[];
      blurb: string;
    },
  ): Promise<{ review: Review } | { error: string }> {
    // checks review doesn't already exist for user and item
    const existingUser = await this.reviews.findOne({
      user,
      item,
    });

    if (existingUser) {
      return {
        error:
          `Review already exists for user with ID ${user} and item with ID ${item}.`,
      };
    }

    const newReviewId = freshID() as Review;

    // create ratings
    const ratings: Rating[] = [];
    for (const i in categories) {
      const newRatingId = freshID() as Rating;
      await this.ratings.insertOne({
        _id: newRatingId,
        review: newReviewId,
        category: categories[i],
        stars: stars[i],
      });
      ratings.push(newRatingId);
    }

    // create new review
    await this.reviews.insertOne({
      _id: newReviewId,
      user,
      item,
      ratings,
      blurb,
    });

    return { review: newReviewId };
  }

  /**
   * Action: Edits a review's rating.
   * @requires the review exists in the set of reviews and is associated with the user
   * @effects updates the review’s rating for the given category to the given stars amount and returns the review
   */
  async editRating(
    { user, review, category, stars }: {
      user: User;
      review: Review;
      category: string;
      stars: number;
    },
  ): Promise<{ review: Review } | { error: string }> {
    // check review exists and is associated with user
    const currReview = await this.reviews.findOne({
      _id: review,
      user: user,
    });

    if (!currReview) {
      return {
        error: `Review with ID ${review} and user ID ${user} not found.`,
      };
    }

    // update rating
    await this.ratings.updateOne({ review: review, category: category }, {
      $set: { stars: stars },
    });

    return { review: review };
  }

  /**
   * Action: Edits a review's blurb.
   * @requires the review exists in the set of reviews and is associated with the user
   * @effects updates the review’s blurb and returns the review
   */
  async editBlurb(
    { user, review, blurb }: {
      user: User;
      review: Review;
      blurb: string;
    },
  ): Promise<{ review: Review } | { error: string }> {
    // check review exists and is associated with user
    const currReview = await this.reviews.findOne({
      _id: review,
      user: user,
    });

    if (!currReview) {
      return {
        error: `Review with ID ${review} and user ID ${user} not found.`,
      };
    }

    // update blurb
    await this.reviews.updateOne({ _id: review }, {
      $set: { blurb: blurb },
    });

    return { review: review };
  }

  /**
   * Action: Deletes a review.
   * @requires the review exists in the set of reviews and is associated with the user
   * @effects removes the review from the set of reviews
   */
  async deleteReview(
    { user, review }: {
      user: User;
      review: Review;
    },
  ): Promise<Empty | { error: string }> {
    // check review exists and is associated with user
    const currReview = await this.reviews.findOne({
      _id: review,
      user: user,
    });

    if (!currReview) {
      return {
        error: `Review with ID ${review} and user ID ${user} not found.`,
      };
    }

    // delete review and associated ratings
    await this.reviews.deleteOne({ _id: review });
    await this.ratings.deleteMany({ review: review });

    return {};
  }

  /**
   * Query: Retrieves all reviews for a given item.
   * @effects returns all reviews for a given item
   */
  async _getReviewsByItem(
    { item }: { item: Item },
  ): Promise<{ review: Review; user: User }[]> {
    const posts = await this.reviews.find({ item: item }).toArray();
    return posts.map((r) => ({ review: r._id, user: r.user }));
  }

  /**
   * Query: Retrieves all created by a given user.
   * @effects returns all reviews created by a given user
   */
  async _getReviewsFromUser(
    { user }: { user: User },
  ): Promise<{ review: Review }[]> {
    const posts = await this.reviews.find({ user: user }).toArray();
    return posts.map((r) => ({ review: r._id }));
  }
}
