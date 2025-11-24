# API Notification Concept

[@api-extraction-from-code.md](../../design/tools/api-extraction-from-code.md)

[@PasswordAuthConcept.ts](../../src/concepts/PasswordAuthConcept/PasswordAuthConcept.ts)

# prompt: Using the concept implementation of the PasswordAuth concept in PasswordAuthConcept.ts, follow the prompt in api-extraction-from-code.

# response:

# API Specification: PasswordAuth Concept

**Purpose:** Enables users to securely identify themselves and manage their access through username and password credentials.

---

## API Endpoints

### POST /api/PasswordAuth/register

**Description:** Creates a new user account with a unique username and password.

**Requirements:**
- no User currently exists with the given `username`

**Effects:**
- creates a new User `u` associated with the provided `username` and the hash of `password`; returns the newly created `user`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/PasswordAuth/authenticate

**Description:** Verifies a user's credentials and returns their user ID upon success.

**Requirements:**
- a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`

**Effects:**
- returns user associated with username

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/PasswordAuth/deleteAccount

**Description:** Deletes a user account after successful authentication.

**Requirements:**
- a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`

**Effects:**
- deletes the User associated with the given `username`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
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
### POST /api/PasswordAuth/changePassword

**Description:** Updates a user's password after verifying their current password.

**Requirements:**
- a User exists whose `username` matches the input `username` and whose `password` hash corresponds to `currentPass`

**Effects:**
- updates the `password` of the User associated with the given `username` to correspond to `newPass`

**Request Body:**
```json
{
  "username": "string",
  "currentPass": "string",
  "newPass": "string"
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
### POST /api/PasswordAuth/_getUsers

**Description:** Retrieves a list of all registered users' usernames.

**Requirements:**
- true

**Effects:**
- returns all registered users (excluding passwords)

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "user": {
      "username": "string"
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