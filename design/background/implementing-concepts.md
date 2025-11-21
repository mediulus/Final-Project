# Concept Implementation

Concepts can be implemented as a single TypeScript class, and must obey the following properties:
1. No import statements can reference another concept in any way, including type declarations.
2. All methods are either actions or queries from the spec: query methods are named beginning with a `_` character.
3. Every action must take a single argument, and output a single argument: both of these are a dictionary/JSON object with primitive values (no custom objects).

For our specific implementation, we will use MongoDB as the database. Each piece of the concept spec is mapped onto the implementation as follows:

- **concept**: the name of the class is {name} + Concept
- **purpose**: the purpose is kept and versioned alongside the code in documentation
- **principle**: the principle helps establish a canonical test and models out desirable behavior
- **state**: the state relations can be mapped directly to the MongoDB collections
- **actions**: each action is a method of the same name, and takes in a dictionary with the keys described by the action parameters in the specification with the specified types
- **queries**: potential queries are also methods, but must begin with an underscore `_`
	- **Important:** queries MUST return an **array** of the type specified by the return signature

## Technology stack details

- Make sure that each action/method preserves its **requires**, and performs the specified **effects** in terms of its updates on the MongoDB collection. 
- It should be possible to confirm any expectations for what the state looks like when described in **effects** or **principle** using the chosen set of **queries**.
- Use the Deno runtime to minimize setup, and qualified imports such as `import { Collection, Db } from "npm:mongodb";`

# approach: steps to implementation

The following prefix format for header 1 blocks denote the relevant steps:

* `# concept: {name}`
	* A specification of the concept we're looking to implement
* `# file: src/concepts/{name}/{name}Concept.ts`
	* The implementation of the concept class as a TypeScript code block
* `# problem:`
	* Description of any issues that arise with running/operating the implementation
* `# solution:`
	* A proposed solution, followed by any updates through a `# file:` block

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

# Creating concepts and their state

Each top level concept state is a property associated with that collection. For example, for the following Labeling concept:

```concept
concept Labeling [Item]
state

a set of Items with
    a labels set of Label
a set of Labels with
    a name String

actions

createLabel (name: String)
addLabel (item: Item, label: Label)
deleteLabel (item: Item, label: Label)
```

you would have the following class properties and constructor:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Labeling" + ".";

// Generic types of this concept
type Item = ID;
type Label = ID;

/**
 * a set of Items with
 *   a labels set of Label
 */
interface Items {
  _id: Item;
  labels: Label[];
}

/**
 * a set of Labels with
 *   a name String
 */
interface Labels {
  _id: Label;
  name: string;
}

export default class LabelingConcept {
  items: Collection<Items>;
  labels: Collection<Labels>;
  constructor(private readonly db: Db) {
    this.items = this.db.collection(PREFIX + "items");
    this.labels = this.db.collection(PREFIX + "labels");
  }
  /**
   * createLabel (name: String)
   *
   * **requires** ...
   *
   * **effects** ...
   */
  createLabel({ name }: { name: string }): Empty {
    // todo: create label
    return {};
  }
  /**
   * addLabel (item: Item, label: Label)
   *
   * **requires** ...
   *
   * **effects** ...
   */
  addLabel({ item, label }: { item: Item; label: Label }): Empty {
    // todo: add label
    return {};
  }
  /**
   * deleteLabel (item: Item, label: Label)
   *
   * **requires** ...
   *
   * **effects** ...
   */
  deleteLabel({ item, label }: { item: Item; label: Label }): Empty {
    // todo: delete label
    return {};
  }
}
```

Note that even for actions that don't want to return anything, you should return an empty record `{}`. To denote the type of this properly, you can use the provided `Empty` type from `@utils/types.ts` which simply specifies the type as `Record<PropertyKey, never>`.

# Dictionaries as arguments and results

Note that the arguments and results of actions are always dictionaries. For example if an action in a specification has the signature

```
action (a: A, b: B): (c: C)
```

this means that the implementation should take a dictionary with fields named `a` and `b`, and return a dictionary with a field `c`. Error results are returned as a dictionary with a field `error` which is generally a string:

```
action (a: A, b: B): (error: string)
```

Queries always return an array of dictionaries so if the specification has this signature:

```
\_query (a: A, b: B): (c: C)
```

the implementation should return an array of dictionaries each with a field called `c`. For example, given this state

```
	a set of Groups with
	  a users set of User

	a set of Users with
	  a username String
	  a password String
```

the query specification

```
	\_getUsersWithUsernamesAndPasswords (group: Group) : (user: {username: String, password: String})
    **requires** group exists
    **effects** returns set of all users in the group each with its username and password
```

says that the query should return an array of dictionaries, each with a `user` field that holds a dictionary with a `username` and `password` field.

# Imports

The following `deno.json` file lists additional imports that are available to help ease imports. In particular, the utility folder and the concept folder are available as the `@utils` and `@concepts` prefixes.

[@deno.json](/deno.json)

# Initialization

We provide a helper database script in `@utils` that reads the environment variables in your `.env` file and initializes a MongoDB database. For normal app development, use:

```typescript
import {getDb} from "@utils/database.ts";
import SessioningConcept from "@concepts/SessioningConcept.ts"

const [db, client] = await getDb(); // returns [Db, MongoClient]
```

# Error handling

Only throw errors when they are truly exceptional. Otherwise, all normal errors should be caught, and instead return a record `{error: "the error message"}` to allow proper future synchronization with useful errors.

# Documentation

Every concept should have inline documentation and commenting:
- The concept itself should be paired with its purpose.
- The state should be described next to any types.
- Any testing should be guided by the principle.
- Each action should state the requirements and effects, and tests should check that both work against variations.

# Commenting

Every action should have a comment including its signature, its requirements, and effects:
```typescript
  /**
   * createLabel (name: String): (label: Label)
   *
   * **requires** no Label with the given `name` already exists
   *
   * **effects** creates a new Label `l`; sets the name of `l` to `name`; returns `l` as `label`
   */
```
