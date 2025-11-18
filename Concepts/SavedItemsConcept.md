# concept SavedItems

**concept** SavedItems[User, Item]

**purpose** allow each user to keep track of specific items they are interested in by saving them under customizable tags; enables personalized organization and quick retrieval of followed items.

**principle** a user selects items that they want to save, each with corresponding tags; user can then retrieve those items quickly and/or change their tags, unsave them, etc.

**state**

   	a set of UserRecords with ...
         	a User
         	a set of SavedItems
	A set of SavedItems with …
		a Item
		a set of Tag strings
	
**actions**

    addUserRecord (user: User): (userRecord: UserRecord)
        requires: no UserRecord already for user already exists
        effects: creates a new UserRecord for user with an empty set of SavedItems

    deleteUserRecord (user: User):
        requires: UserRecord already for user already exists
        effects: deletes the UserRecord for user 

    addItem (user: User, item: Item, tag: string):
        requires: a UserRecord exists for user; if a corresponding SavedItem for item exists in user’s set of items, the tag must not already be in its tag set
        effects: adds the item to the user’s SavedItems with the given tag if it does not exist; otherwise, adds the tag to the existing SavedItem’s tag set
        requires: a UserRecord exists for user, SavedItem for that item is in set of user’s SavedItems
        effects: removes corresponding SavedItem from user's UserRecord's set of items
        
    removeItemTag (user: User, item: Item, tag: String):
        requires: a UserRecord exists for user, corresponding SavedItem for item is in user's set of items and tag is in its set of tags
        effects: removes tag from corresponding SavedItem’s set of tags 



