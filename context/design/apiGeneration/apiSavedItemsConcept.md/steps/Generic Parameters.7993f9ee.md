---
timestamp: 'Sun Nov 23 2025 23:01:55 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_230155.0f1956cf.md]]'
content_id: 7993f9eef6987f59cf924191d6709c135f3a361c10f320fff9a212a9c515c67e
---

# Generic Parameters: managing IDs

When using MongoDB, ignore the usage of ObjectId, and instead store all state as strings. To simplify and maintain typing, we provide a helper utility type that is identical to a string, but uses type branding to remain useful as a generic ID type:

```typescript
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

type Item = ID;

// Override _id when inserting into MongoDB
const item = {
	_id: freshID(),
};
```

An `ID` can be otherwise treated as a string for the purposes of insertion. When inserting new documents into MongoDB collections, override the `_id` field with a fresh ID using the provided utility function.

If you need to manually create an ID (e.g. during testing), simply assert that the string is of the same type:

```typescript
import { ID } from "@utils/types.ts";

const userA = "user:Alice" as ID;
```
