---
timestamp: 'Tue Oct 07 2025 21:14:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251007_211416.1e2a1c1e.md]]'
content_id: 087161ea543267e0dee935a44ef36880c9cb21f3702d7174519ebef8e8db9802
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
