---
timestamp: 'Sun Nov 23 2025 23:08:26 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_230826.e7c5e029.md]]'
content_id: fa0e359ec67d7cf3046cf82e87442bd532d86c142fcea5470b2cb53e22531524
---

# file: src\concepts\USerInfoConcept\UserInfoConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInfo" + ".";

// Generic types for the concept's external dependencies
type User = ID;

// Internal entity types, represented as IDs
type UserInfo = ID;

export enum Gender {
  Female,
  Male,
  NonBinary,
  PreferNotToSay,
}
export enum Affiliation {
  Undergraduate,
  Graduate,
  Faculty,
  Affiliate,
}

/**
 * State: A set of UserInfos with a user, age, gender, affiliation, and email address.
 */
export interface UserInfoDoc {
  _id: UserInfo;
  user: User;
  age: number;
  gender: Gender;
  affiliation: Affiliation;
  emailAddress: string;
}

/**
 * @concept UserInfo
 * @purpose to keep track of a user’s personal information
 */
export default class UserInfoConcept {
  userInfos: Collection<UserInfoDoc>;

  constructor(private readonly db: Db) {
    this.userInfos = this.db.collection(PREFIX + "userInfos");
  }

  /**
   * Action: Adds a new user and their info.
   * @requires a userInfo with user doesn’t exist in set of userInfos
   * @effects creates and returns a new userInfo with user, emailAddress, gender, age, and affiliation
   */
  async setInfo(
    { user, age, gender, affiliation, emailAddress }: {
      user: User;
      age: number;
      gender: Gender;
      affiliation: Affiliation;
      emailAddress: string;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo doesn't already exist for user
    const existingUser = await this.userInfos.findOne({
      user,
    });

    if (existingUser) {
      return {
        error: `UserInfo already exists for user with ID ${user}.`,
      };
    }

    // adds userInfo
    const newUserInfoId = freshID() as UserInfo;

    await this.userInfos.insertOne({
      _id: newUserInfoId,
      user,
      age,
      gender,
      affiliation,
      emailAddress,
    });

    return { userInfo: newUserInfoId };
  }

  /**
   * Action: Removes a user and their info.
   * @requires userInfo with user exists in set of userInfos
   * @effects removes user's userInfo from set of userInfos
   */
  async deleteInfo(
    { user }: {
      user: User;
    },
  ): Promise<Empty | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // removes userInfo
    await this.userInfos.deleteOne({ user: user });
    return {};
  }

  /**
   * Action: Updates a user's age.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates age of user's userInfo to given age and returns userInfo
   */
  async updateAge(
    { user, age }: {
      user: User;
      age: number;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update age
    await this.userInfos.updateOne({ user: user }, { $set: { age: age } });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's gender.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates gender of user's userInfo to given gender and returns userInfo
   */
  async updateGender(
    { user, gender }: {
      user: User;
      gender: Gender;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update gender
    await this.userInfos.updateOne({ user: user }, {
      $set: { gender: gender },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's affiliation.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates affiliation of user's userInfo to given affiliation and returns userInfo
   */
  async updateAffiliation(
    { user, affiliation }: {
      user: User;
      affiliation: Affiliation;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update affiliation
    await this.userInfos.updateOne({ user: user }, {
      $set: { affiliation: affiliation },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }

  /**
   * Action: Updates a user's email address.
   * @requires userInfo with user exists in set of userInfos
   * @effects updates email address of user's userInfo to given email address and returns userInfo
   */
  async updateEmailAddress(
    { user, emailAddress }: {
      user: User;
      emailAddress: string;
    },
  ): Promise<{ userInfo: UserInfo } | { error: string }> {
    // checks userInfo already exists for user
    const currUser = await this.userInfos.findOne({ user: user });
    if (!currUser) {
      return { error: `User with ID ${user} not found.` };
    }

    // update email address
    await this.userInfos.updateOne({ user: user }, {
      $set: { emailAddress: emailAddress },
    });

    const userInfo = await this.userInfos.find({ user: user }).toArray();

    return userInfo.map((u) => ({
      userInfo: u._id,
    }))[0];
  }
}

```
