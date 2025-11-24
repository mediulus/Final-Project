# API Sessioning Concept

[@api-extraction-from-code.md](../../design/tools/api-extraction-from-code.md)

[@SessioningConcept.ts](../../src/concepts/SessioningConcept/SessioningConcept.ts)

# prompt: Using the concept implementation of the Sessioning concept in SessioningConcept.ts, follow the prompt in api-extraction-from-code.

# response:

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

---

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a given user.

**Requirements:**
- true.

**Effects:**
- Creates a new Session `s`.
- Associates it with the given `user`.
- Returns `s` as `session`.

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
---
### POST /api/Sessioning/delete

**Description:** Deletes an existing session.

**Requirements:**
- The given `session` exists.

**Effects:**
- Removes the session `s`.

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
---
### POST /api/Sessioning/_getUser

**Description:** Gets the user associated with an existing session.

**Requirements:**
- The given `session` exists.

**Effects:**
- Returns the user associated with the session.

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
---
