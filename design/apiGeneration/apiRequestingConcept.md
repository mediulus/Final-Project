# API Requesting Concept

[@api-extraction-from-code.md](../../design/tools/api-extraction-from-code.md)

[@RequestingConcept.ts](../../src/concepts/RequestingConcept/RequestingConcept.ts)

# prompt: Using the concept implementation of the Requesting concept in RequestingConcept.ts, follow the prompt in api-extraction-from-code.

# response:

# API Specification: Requesting Concept

**Purpose:** The Requesting concept encapsulates an API server, modeling incoming requests and outgoing responses as concept actions.

---

## API Endpoints

### POST /api/Requesting/request

**Description:** Creates a new request record to track an incoming API call and returns its unique ID.

**Requirements:**
- true

**Effects:**
- creates a new Request `r`; sets the input of `r` to be the path and all other input parameters; returns `r` as `request`

**Request Body:**
```json
{
  "path": "string",
  "...": "any"
}
```

**Success Response Body (Action):**
```json
{
  "request": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Requesting/respond

**Description:** Provides a response to a previously created, pending request.

**Requirements:**
- a Request with the given `request` id exists and has no response yet

**Effects:**
- sets the response of the given Request to the provided key-value pairs.

**Request Body:**
```json
{
  "request": "string",
  "...": "any"
}
```

**Success Response Body (Action):**
```json
{
  "request": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
### POST /api/Requesting/_awaitResponse

**Description:** Waits for and returns the response associated with a specific request ID.

**Requirements:**
- None specified.

**Effects:**
- returns the response associated with the given request, waiting if necessary up to a configured timeout.

**Request Body:**
```json
{
  "request": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "response": "any"
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