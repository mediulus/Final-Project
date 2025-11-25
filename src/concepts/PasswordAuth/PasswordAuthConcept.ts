import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { createHash } from "node:crypto";

const PREFIX = "PasswordAuth" + ".";

type User = ID;

/**
 * a set of Users with
 *   a username String
 *   a password Hash
 */
interface PasswordAuthUser {
  _id: User;
  username: string;
  password: string; // hashed password
}

/**
 * @concept PasswordAuth Concept
 *
 * @purpose
 * Enables users to securely identify themselves and manage their access through username and password credentials.
 *
 * @principle
 * If a user registers with a unique username and password, then they can later provide those same credentials to be authenticated as that user.
 */
export default class PasswordAuthConcept {
  users: Collection<PasswordAuthUser>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /** Utility: hash a password using SHA-256 */
  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  /**
   * Action: register (username: String, password: String): (user: User)
   *
   * @requires
   * no User currently exists with the given `username`
   *
   * @effects
   * creates a new User `u` associated with the provided `username` and
   * the hash of `password`; returns the newly created `user`
   */
  async register({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: User} | {error: string }> {
    const existing = await this.users.findOne({ username });
    if (existing) return { error: "Username already exists" };

    const user: User = freshID();
    const hashed = this.hashPassword(password);

    await this.users.insertOne({ _id: user, username, password: hashed });
    return { user };
  }

  /**
   * Action: authenticate (username: String, password: String): (user: User)
   *
   * @requires
   * a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`
   *
   * @effects
   * returns user associated with username
   */
  async authenticate({
    username,
    password,
  }: {
    username: string;
    password: string;
  }):Promise<{ user: User } | { error: string }> {
    const record = await this.users.findOne({ username });
    if (!record) return { error: "No such user" };

    const hashed = this.hashPassword(password);
    if (record.password !== hashed) return { error: "Incorrect password" };

    return { user: record._id };
  }

  /**
   * Action: deleteAccount (username: String, password: String)
   *
   * @requires
   * a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`
   *
   * @effects
   * deletes the User associated with the given `username`, returns that user upon deletion
   */
  async deleteAccount({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: User } | { error: string }> {
    const record = await this.users.findOne({ username });
    if (!record) return { error: "No such user" };

    const hashed = this.hashPassword(password);
    if (record.password !== hashed) return { error: "Incorrect password" };

    await this.users.deleteOne({ _id: record._id });
    return { user: record._id };
  }

  /**
   * changePassword (username: String, currentPass: String, newPass: String)
   *
   * **requires**
   * a User exists whose `username` matches the input `username` and whose `password` hash corresponds to `currentPass`
   *
   * **effects**
   * updates the `password` of the User associated with the given `username` to correspond to `newPass`
   */
  async changePassword({
    username,
    currentPass,
    newPass,
  }: {
    username: string;
    currentPass: string;
    newPass: string;
  }): Promise<Empty | { error: string }> {
    const record = await this.users.findOne({ username });
    if (!record) return { error: "No such user" };

    const hashedCurrent = this.hashPassword(currentPass);
    if (record.password !== hashedCurrent) return { error: "Incorrect password" };

    const newHashed = this.hashPassword(newPass);
    await this.users.updateOne(
      { _id: record._id },
      { $set: { password: newHashed } }
    );
    return {};
  }

  /**
   * _getUsers(): (user: {username: String})
   *
   * **requires**
   * true
   *
   * **effects**
   * returns all registered users (excluding passwords)
   */
  async _getUsers(): Promise<{ user: { username: string } }[]> {
    const users = await this.users.find().toArray();
    return users.map((u) => ({ user: { username: u.username } }));
  }

  async _getUsername({ user }: { user: User }): Promise<{ username: string }[]> {
    const record = await this.users.findOne({ _id: user });
    if (!record) return [];
    return [{ username: record.username }];
  }

  /**
   * _getUser (username: string): { user: User }[]
   *
   * **requires** username exists
   * **effects** returns the corresponding user ID for that username
   */
  async _getUser(
    { username }: { username: string },
  ): Promise<{ user: string }[]> {
    const record = await this.users.findOne({ username });
    if (!record) return [];
    return [{ user: record._id }];
  }

}
