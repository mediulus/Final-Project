# Reviewing Concept

**concept** Reviewing [User, Item]

**purpose** to allow users to indicate their opinions about items

**principle** after a user makes a review for an item, other users can see and refer to the user’s public opinions in order to make their own decisions about the item; the user can then edit or delete their review to update or hide their public opinions from other users’ views

**state**

    a set of Reviews with
        a User
        an Item
        a set of Ratings
        a blurb string

    a set of Ratings with
        a Review
        a category string
        a stars Number

**actions**

    makeReview(user: User, item: Item, set of categories: strings, set of stars: Numbers, blurb: string) : (review: Review)
        requires:
            - a review for the user and item doesn’t exist in the set of reviews
            - all categories in the set of categories are unique
        effects: creates ratings from the corresponding categories and stars, and then creates and returns a review associated with the user, item, ratings, and blurb

    editRating(user: User, review: Review, category: string, stars: Number) : (review: Review)
        requires: the review exists in the set of reviews and is associated with the user
        effects: updates the review’s rating for the given category to the given stars amount and returns the review

    editBlurb(user: User, review: Review, blurb: string) : (review: Review)
        requires: the review exists in the set of reviews and is associated with the user
        effects: updates the review’s blurb and returns the review

    deleteReview(user: User, review: Review)
        requires: the review exists in the set of reviews and is associated with the user
        effects: removes the review from the set of reviews

**actions**

    getReviewsByItem(item: item) : (reviews: set of Reviews)
        effects: returns all reviews for a given item

    getReviewsByUser(user: user) : (reviews: set of Reviews)
        effects: returns all reviews created by a given user
