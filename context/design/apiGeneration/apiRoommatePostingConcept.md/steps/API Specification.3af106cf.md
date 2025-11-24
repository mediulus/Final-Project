---
timestamp: 'Sun Nov 23 2025 23:01:02 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_230102.b5697a47.md]]'
content_id: 3af106cf428a612b2bb226dfec7459ace3fbbbad30bfb5f14984b0c19ec069bf
---

# API Specification: RoommatePosting Concept

**Purpose:** Manages roommate postings for MIT students looking for summer housing companions.

***

## API Endpoints

### POST /api/RoommatePosting/create

**Description:** Creates a new roommate posting for a user.

**Requirements:**

* A roommate posting with this poster does not already exist.

**Effects:**

* Creates and returns a new posting with the given poster, city, gender, age, and description.

**Request Body:**

```json
{
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/editCity

**Description:** Updates the city for a user's roommate posting.

**Requirements:**

* A roommate posting with this poster exists.

**Effects:**

* Updates the posting's city to the given city and returns the updated posting.

**Request Body:**

```json
{
  "poster": "string",
  "city": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/editGender

**Description:** Updates the gender for a user's roommate posting.

**Requirements:**

* A roommate posting with this poster exists.

**Effects:**

* Updates the posting's gender to the given gender and returns the updated posting.

**Request Body:**

```json
{
  "poster": "string",
  "gender": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/editAge

**Description:** Updates the age for a user's roommate posting.

**Requirements:**

* A roommate posting with this poster exists.

**Effects:**

* Updates the posting's age to the given age and returns the updated posting.

**Request Body:**

```json
{
  "poster": "string",
  "age": "number"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/editDescription

**Description:** Updates the description for a user's roommate posting.

**Requirements:**

* A roommate posting with this poster exists.

**Effects:**

* Updates the posting's description to the given description and returns the updated posting.

**Request Body:**

```json
{
  "poster": "string",
  "description": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/delete

**Description:** Deletes a specific roommate posting.

**Requirements:**

* The posting exists.

**Effects:**

* Deletes the posting from the set of roommate postings.

**Request Body:**

```json
{
  "postingId": "string"
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

***

### POST /api/RoommatePosting/getPostingById

**Description:** Retrieves a single roommate posting by its unique ID.

**Requirements:**

* A posting with the given `postingId` exists.

**Effects:**

* Returns the matching posting.

**Request Body:**

```json
{
  "postingId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/getPostingByPosterId

**Description:** Retrieves the roommate posting created by a specific user.

**Requirements:**

* The poster has a posting.

**Effects:**

* Retrieves the posting for the given poster.

**Request Body:**

```json
{
  "posterId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "poster": "string",
  "city": "string",
  "gender": "string",
  "age": "number",
  "description": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/getAllPostings

**Description:** Retrieves all available roommate postings.

**Requirements:**

* At least one posting exists.

**Effects:**

* Returns all postings.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "poster": "string",
    "city": "string",
    "gender": "string",
    "age": "number",
    "description": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/getPostingsByCity

**Description:** Retrieves all roommate postings located in a specific city.

**Requirements:**

* At least one posting exists with the given city.

**Effects:**

* Returns the postings with that city.

**Request Body:**

```json
{
  "city": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "poster": "string",
    "city": "string",
    "gender": "string",
    "age": "number",
    "description": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/RoommatePosting/getPostingsByAge

**Description:** Retrieves all roommate postings from users of a specific age.

**Requirements:**

* At least one posting exists with the given age.

**Effects:**

* Returns the postings with that age.

**Request Body:**

```json
{
  "age": "number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "poster": "string",
    "city": "string",
    "gender": "string",
    "age": "number",
    "description": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
