import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "SavedItems" + ".";

// Generic parameters
type User = ID;
type Item = ID;
type UserRecord = ID;
type SavedItem = ID;



/**
 * a set of UserRecords with
 *   a User
 *   a set of SavedItems
 */
interface UserRecordDoc {
  _id: UserRecord;
  user: User;
  savedItems: SavedItem[];
}

/**
 * a set of SavedItems with
 *   an Item
 *   a Tags set of Strings
 */
interface SavedItemDoc {
  _id: SavedItem;
  item: Item;
  tags: string[];
  user: User; // associate with user for uniqueness per user
}


/**
 * SavedItems Concept
 *
 * **purpose**
 * allow each user to keep track of specific items they are interested in by saving them under customizable tags; enables personalized organization and quick retrieval of followed items.
 *
 * **principle**
 * a user selects items that they want to save, each with corresponding tags; user can then retrieve those items quickly and/or change their tags, unsave them, etc.
 */
export default class SavedItemsConcept {
  userRecords: Collection<UserRecordDoc>;
  savedItems: Collection<SavedItemDoc>;

  constructor(private readonly db: Db) {
    this.userRecords = this.db.collection(PREFIX + "userRecords");
    this.savedItems = this.db.collection(PREFIX + "savedItems");
  }


  /**
   * addUserRecord (user: User): (userRecord: UserRecord)
   *
   * **requires** no UserRecord for user already exists
   * **effects** creates a new UserRecord for user with an empty set of SavedItems
   */
  async addUserRecord({
    user,
  }: {
    user: User;
  }): Promise<{ userRecord: UserRecord } | { error: string }> {
    const existing = await this.userRecords.findOne({ user });
    if (existing) return { error: "UserRecord already exists" };

    const userRecord: UserRecord = freshID();
    await this.userRecords.insertOne({
      _id: userRecord,
      user,
      savedItems: [],
    });
    return { userRecord };
  }

  /**
   * deleteUserRecord (user: User)
   *
   * **requires** a UserRecord for user already exists
   * **effects** deletes the UserRecord for user
   */
  async deleteUserRecord({
    user,
  }: {
    user: User;
  }): Promise<Empty | { error: string }> {
    const record = await this.userRecords.findOne({ user });
    if (!record) return { error: "No UserRecord exists for user" };

    await this.userRecords.deleteOne({ _id: record._id });
    await this.savedItems.deleteMany({ user });
    return {};
  }

  /**
   * addItemTag (user: User, item: Item, tag: String)
   *
   * **requires**
   * - UserRecord exists for user
   * - if SavedItem exists, tag must not already be present
   *
   * **effects**
   * creates SavedItem if needed and adds tag
   */
  async addItemTag({
    user,
    item,
    tag,
  }: {
    user: User;
    item: Item;
    tag: string;
  }): Promise<Empty | { error: string }> {
    const record = await this.userRecords.findOne({ user });
    if (!record) return { error: "No UserRecord for user" };

    let saved = await this.savedItems.findOne({ user, item });
    if (!saved) {
      const savedItem: SavedItem = freshID();
      await this.savedItems.insertOne({
        _id: savedItem,
        item,
        user,
        tags: [tag],
      });
      await this.userRecords.updateOne(
        { _id: record._id },
        { $push: { savedItems: savedItem } }
      );
    } else if (saved.tags.includes(tag)) {
      return { error: "Tag already exists for this item" };
    } else {
      await this.savedItems.updateOne(
        { _id: saved._id },
        { $push: { tags: tag } }
      );
    }
    return {};
  }

  /**
   * removeItemTag (user: User, item: Item, tag: String)
   *
   * **requires** a UserRecord for user exists; SavedItem for item exists and tag is in its tag set
   *
   * **effects**
   * removes tag; deletes SavedItem if tag set becomes empty
   */
  async removeItemTag({
    user,
    item,
    tag,
  }: {
    user: User;
    item: Item;
    tag: string;
  }): Promise<Empty | { error: string }> {
    const record = await this.userRecords.findOne({ user });
    if (!record) return { error: "No UserRecord for user" };

    const saved = await this.savedItems.findOne({ user, item });
    if (!saved) return { error: "Item not saved for user" };
    if (!saved.tags.includes(tag)) return { error: "Tag not found" };

    const newTags = saved.tags.filter((t) => t !== tag);
    if (newTags.length === 0) {
      await this.savedItems.deleteOne({ _id: saved._id });
      await this.userRecords.updateOne(
        { _id: record._id },
        { $pull: { savedItems: saved._id } }
      );
    } else {
      await this.savedItems.updateOne(
        { _id: saved._id },
        { $set: { tags: newTags } }
      );
    }
    return {};
  }

  /**
   * removeItem (user: User, item: Item)
   *
   * **requires** a UserRecord exists for user, SavedItem for item exists
   *
   * **effects** removes SavedItem from user’s record and deletes it
   */
  async removeItem({
    user,
    item,
  }: {
    user: User;
    item: Item;
  }): Promise<Empty | { error: string }> {
    const record = await this.userRecords.findOne({ user });
    if (!record) return { error: "No UserRecord for user" };

    const saved = await this.savedItems.findOne({ user, item });
    if (!saved) return { error: "Item not found" };

    await this.savedItems.deleteOne({ _id: saved._id });
    await this.userRecords.updateOne(
      { _id: record._id },
      { $pull: { savedItems: saved._id } }
    );
    return {};
  }


  /**
   * _getSavedItems (user: User): (item: {item: Item, tags: String[]})
   *
   * **requires** userRecord exists
   * **effects** returns all items with their tag sets for the given user
   */
  async _getSavedItems({
    user,
  }: {
    user: User;
  }): Promise<{ savedItem: { item: Item; tags: string[] } }[]> {
    const record = await this.userRecords.findOne({ user });
    if (!record) return []; // no error, just empty array

    const items = await this.savedItems.find({ user }).toArray();

    // 🔧 Wrap each record under a consistent key "savedItem"
    return items.map((s) => ({
      savedItem: { item: s.item, tags: s.tags },
    }));
  }


  /**
   * _getUsersTrackingItem (item: Item): (user: {user: User, tags: String[]})
   *
   * **requires** at least one SavedItem exists with given item
   * **effects** returns all users who have saved this item, each with their associated tag set
   */
  async _getUsersTrackingItem({
    item,
  }: {
    item: Item;
  }): Promise<{ user: { user: User; tags: string[] } }[]> {
    const savedRecords = await this.savedItems.find({ item }).toArray();
    return savedRecords.map((r) => ({ user: { user: r.user, tags: r.tags } }));
  }
}
