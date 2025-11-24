---
timestamp: 'Sun Nov 23 2025 23:08:49 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_230849.70691d8e.md]]'
content_id: c0028f1667bbade56ba4d3bba5d8e0d4862bb70bfb9f6351197ed37eb39b312c
---

# API Specification: UserInfo Concept

**Purpose:** to keep track of a user’s personal information

***

## API Endpoints

### POST /api/UserInfo/setInfo

**Description:** Adds a new user and their info.

**Requirements:**

* A userInfo with the given `user` ID doesn’t already exist.

**Effects:**

* Creates and returns a new userInfo with the provided `user`, `emailAddress`, `gender`, `age`, and `affiliation`.

**Request Body:**

```json
{
  "user": "string (ID)",
  "age": "number",
  "gender": "number (enum)",
  "affiliation": "number (enum)",
  "emailAddress": "string"
}
```

**Success Response Body (Action):**

```json
{
  "userInfo": "string (ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInfo/deleteInfo

**Description:** Removes a user and their info.

**Requirements:**

* A userInfo with the given `user` ID exists.

**Effects:**

* Removes the user's userInfo from the system.

**Request Body:**

```json
{
  "user": "string (ID)"
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

### POST /api/UserInfo/updateAge

**Description:** Updates a user's age.

**Requirements:**

* A userInfo with the given `user` ID exists.

**Effects:**

* Updates the age of the user's userInfo to the given `age` and returns the `userInfo` ID.

**Request Body:**

```json
{
  "user": "string (ID)",
  "age": "number"
}
```

**Success Response Body (Action):**

```json
{
  "userInfo": "string (ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInfo/updateGender

**Description:** Updates a user's gender.

**Requirements:**

* A userInfo with the given `user` ID exists.

**Effects:**

* Updates the gender of the user's userInfo to the given `gender` and returns the `userInfo` ID.

**Request Body:**

```json
{
  "user": "string (ID)",
  "gender": "number (enum)"
}
```

**Success Response Body (Action):**

```json
{
  "userInfo": "string (ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInfo/updateAffiliation

**Description:** Updates a user's affiliation.

**Requirements:**

* A userInfo with the given `user` ID exists.

**Effects:**

* Updates the affiliation of the user's userInfo to the given `affiliation` and returns the `userInfo` ID.

**Request Body:**

```json
{
  "user": "string (ID)",
  "affiliation": "number (enum)"
}
```

**Success Response Body (Action):**

```json
{
  "userInfo": "string (ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInfo/updateEmailAddress

**Description:** Updates a user's email address.

**Requirements:**

* A userInfo with the given `user` ID exists.

**Effects:**

* Updates the email address of the user's userInfo to the given `emailAddress` and returns the `userInfo` ID.

**Request Body:**

```json
{
  "user": "string (ID)",
  "emailAddress": "string"
}
```

**Success Response Body (Action):**

```json
{
  "userInfo": "string (ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
