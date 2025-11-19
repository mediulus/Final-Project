# SavedItems Concept

**concept** SavedItems[User, Item]

**purpose** allow each user to keep track of specific items they are interested in by saving them under customizable tags; enables personalized organization and quick retrieval of followed items.

**principle** a user selects items that they want to save, each with corresponding tags; user can then retrieve those items quickly and/or change their tags, unsave them, etc.

**state**

   	a set of UserRecords with
        a User
        a set of SavedItems

	a set of SavedItems with
		an Item
		a Tags set of Strings

**actions**

    addUserRecord(user: User): (userRecord: UserRecord)
        requires: no UserRecord for user already exists
        effects: creates a new UserRecord for user with an empty set of SavedItems

    deleteUserRecord(user: User)
        requires: a UserRecord for user already exists
        effects: deletes the UserRecord for user

    addItemTag(user: User, item: Item, tag: String)
        requires: a UserRecord exists for user; if a corresponding SavedItem for item exists in user’s set of items, the tag must not already be in its tag set
        effects: creates a new SavedItem with tag and item to the user’s SavedItems if it does not exist yet; otherwise, adds the tag to the existing SavedItem’s tag set

    removeItemTag(user: User, item: Item, tag: String)
        requires: a UserRecord exists for user, corresponding SavedItem for item is in user's set of items and tag is in its set of tags
        effects: removes tag from corresponding SavedItem’s set of tags; if SavedItem's set of tags is empty, delete SavedItem

    removeItem(user: User, item: Item)
        requires: a UserRecord exists for user, SavedItem for that item is in set of user’s SavedItems
        effects: removes corresponding SavedItem from user's UserRecord's set of items and removes that corresponding SavedItem

> Notes: SavedItems are unique per user, not globally.
If User A and User B both save Item 1, they get separate SavedItem records.
