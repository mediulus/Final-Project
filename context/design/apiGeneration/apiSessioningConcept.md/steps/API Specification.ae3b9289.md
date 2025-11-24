---
timestamp: 'Sun Nov 23 2025 23:10:23 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_231023.b85e8308.md]]'
content_id: ae3b9289dff5207e5679c8a8e44e8725de4abaec1618d5c2f0155a58d48af7c5
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a given user.

**Requirements:**

* true.

**Effects:**

* Creates a new Session `s`.
* Associates it with the given `user`.
* Returns `s` as `session`.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "session": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Sessioning/delete

**Description:** Deletes an existing session.

**Requirements:**

* The given `session` exists.

**Effects:**

* Removes the session `s`.

**Request Body:**

```json
{
  "session": "ID"
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

### POST /api/Sessioning/\_getUser

**Description:** Gets the user associated with an existing session.

**Requirements:**

* The given `session` exists.

**Effects:**

* Returns the user associated with the session.

**Request Body:**

```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "ID"
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
