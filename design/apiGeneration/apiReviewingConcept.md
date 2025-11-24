# API Reviewing Concept

[@api-extraction-from-code.md](../../design/tools/api-extraction-from-code.md)

[@ReviewingConcept.ts](../../src/concepts/ReviewingConcept/ReviewingConcept.ts)

# prompt: Using the concept implementation of the Reviewing concept in ReviewingConcept.ts, follow the prompt in api-extraction-from-code.

# response:

# API Specification: Reviewing Concept

**Purpose:** to allow users to indicate their opinions about items

---

## API Endpoints

### POST /api/Reviewing/create

**Description:** Creates a new review.

**Requirements:**
- A review for the user and item doesn’t exist in the set of reviews.
- All categories in the provided set of categories are unique.

**Effects:**
- Creates ratings from the corresponding categories and stars.
- Creates and returns a new review associated with the user, item, ratings, and blurb.

**Request Body:**
```json
{
  "user": "string",
  "item": "string",
  "categories": "string[]",
  "stars": "number[]",
  "blurb": "string"
}
```

**Success Response Body (Action):**
```json
{
  "review": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Reviewing/editRating

**Description:** Edits a review's rating for a specific category.

**Requirements:**
- The review exists in the set of reviews and is associated with the user.

**Effects:**
- Updates the review’s rating for the given category to the given stars amount.
- Returns the updated review's ID.

**Request Body:**
```json
{
  "user": "string",
  "review": "string",
  "category": "string",
  "stars": "number"
}
```

**Success Response Body (Action):**
```json
{
  "review": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Reviewing/editBlurb

**Description:** Edits a review's blurb.

**Requirements:**
- The review exists in the set of reviews and is associated with the user.

**Effects:**
- Updates the review’s blurb.
- Returns the updated review's ID.

**Request Body:**
```json
{
  "user": "string",
  "review": "string",
  "blurb": "string"
}
```

**Success Response Body (Action):**
```json
{
  "review": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Reviewing/deleteReview

**Description:** Deletes a review.

**Requirements:**
- The review exists in the set of reviews and is associated with the user.

**Effects:**
- Removes the review and all its associated ratings from the system.

**Request Body:**
```json
{
  "user": "string",
  "review": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Reviewing/_getReviewsByItem

**Description:** Retrieves all reviews for a given item.

**Requirements:**
- (None)

**Effects:**
- Returns all reviews associated with a given item.

**Request Body:**
```json
{
  "item": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "review": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Reviewing/_getReviewsFromUser

**Description:** Retrieves all reviews created by a given user.

**Requirements:**
- (None)

**Effects:**
- Returns all reviews created by a given user.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "review": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---