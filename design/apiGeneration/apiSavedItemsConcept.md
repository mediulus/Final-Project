# API SavedItems Concept

[@api-extraction-from-code.md](../../design/tools/api-extraction-from-code.md)

[@SavedItemsConcept.ts](../../src/concepts/SavedItemsConcept/SavedItemsConcept.ts)

# prompt: Using the concept implementation of the SavedItemsg concept in SavedItemsConcept.ts, follow the prompt in api-extraction-from-code.

# response:

# API Specification: SavedItems Concept

**Purpose:** allow each user to keep track of specific items they are interested in by saving them under customizable tags; enables personalized organization and quick retrieval of followed items.

---

## API Endpoints

### POST /api/SavedItems/addUserRecord

**Description:** Creates a new record for a user to track their saved items.

**Requirements:**
- no UserRecord for user already exists

**Effects:**
- creates a new UserRecord for user with an empty set of SavedItems

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "userRecord": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/SavedItems/deleteUserRecord

**Description:** Deletes a user's record and all associated saved items.

**Requirements:**
- a UserRecord for user already exists

**Effects:**
- deletes the UserRecord for user

**Request Body:**
```json
{
  "user": "ID"
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
### POST /api/SavedItems/addItemTag

**Description:** Adds a tag to an item for a specific user, creating a new saved item record if one does not already exist.

**Requirements:**
- UserRecord exists for user
- if SavedItem exists, tag must not already be present

**Effects:**
- creates SavedItem if needed and adds tag

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID",
  "tag": "string"
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
### POST /api/SavedItems/removeItemTag

**Description:** Removes a tag from a user's saved item. If it's the last tag, the saved item is deleted entirely.

**Requirements:**
- a UserRecord for user exists; SavedItem for item exists and tag is in its tag set

**Effects:**
- removes tag; deletes SavedItem if tag set becomes empty

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID",
  "tag": "string"
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
### POST /api/SavedItems/removeItem

**Description:** Removes a saved item and all its associated tags for a specific user.

**Requirements:**
- a UserRecord exists for user, SavedItem for item exists

**Effects:**
- removes SavedItem from user’s record and deletes it

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID"
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
### POST /api/SavedItems/_getSavedItems

**Description:** Retrieves all items and their associated tags saved by a specific user.

**Requirements:**
- userRecord exists

**Effects:**
- returns all items with their tag sets for the given user

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "item": {
      "item": "ID",
      "tags": [
        "string"
      ]
    }
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
### POST /api/SavedItems/_getUsersTrackingItem

**Description:** Retrieves all users who have saved a specific item, along with the tags each user has applied.

**Requirements:**
- at least one SavedItem exists with given item

**Effects:**
- returns all users who have saved this item, each with their associated tag set

**Request Body:**
```json
{
  "item": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": {
      "user": "ID",
      "tags": [
        "string"
      ]
    }
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