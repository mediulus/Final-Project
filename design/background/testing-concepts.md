# Concept Testing

Testing concepts involves primarily:
1. Confirming that for each action:
    - **requires** is satisfied: if a variety of test cases that do not fulfill the requirement are tested against the concept, they do not succeed (or return a record with an `error:` key).
    - **effects** is satisfied: after the action is performed, we can verify that the state did indeed change according to the effect (or the return is correctly specified).
2. Ensuring that the **principle** is fully modeled by the actions:
    - Demonstrate that the series of actions described in the **principle**, when performed, result in the specified behavior or updates to state.
    
# approach: steps to testing

The following prefix format for header 1 blocks denote the relevant steps:

- `# file: src/{name}/{name}Concept.test.ts`
    - The test file for the concept
- `# trace:`
    - Describes a full trace of actions, such as how the principle is fulfilled.

After the concept specification and file, create another test file that properly tests the concept, and propose how the trace might work.

# Test implementation

While testing, use the `testDb` function, which returns a tuple of the database and client so that you can close it.

```typescript
import { testDb } from "@utils/database.ts";

Deno.test("...", async () => {
  const [db, client] = await testDb();

  // ... tests

  await client.close();
});
```

The database is already automatically dropped before every test file using the `Deno.test.beforeAll` hook: do not include any additional manipulation of the database for this purpose.

Use the Deno.test framework, splitting by appropriate test steps and describing each behavior. Import helpers from:

```typescript
import { assertEquals } from "jsr:@std/assert"; // or any other utility from the library
```

# Legible testing

 - Each test should output what it is doing and the trace of any actions, to help with debugging and increasing confidence that the concept or action is doing what it says.
 - Principle tests and tests involving multiple actions should explain how it aligns with expectations.
 - For action tests, the output should explain how requirements are met and how effects are confirmed.