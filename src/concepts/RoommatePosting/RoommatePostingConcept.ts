import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "RoommatePosting" + ".";

/**
 * Gender options for roommate postings
 */
export enum Gender {
  Female = "Female",
  Male = "Male",
  NonBinary = "Non-Binary",
  PreferNotToSay = "PreferNotToSay",
}

/**
 * Represents a roommate posting for summer housing
 */
export interface RoommatePosting {
  _id: ID;
  poster: ID;
  city: string;
  gender: Gender;
  age: number;
  description: string;
}

/**
 * Manages roommate postings for MIT students looking for summer housing companions
 */
export default class RoommatePostingConcept {
  private postings: Collection<RoommatePosting>;

  constructor(private readonly db: Db) {
    this.postings = this.db.collection(PREFIX + "postings");
  }


  /**
   * Internal helper to retrieve a posting by poster ID
   * @param posterId The ID of the poster
   * @returns The found RoommatePosting object or null if not found
   */
  async getPostingByPoster(
    posterId: ID,
  ): Promise<RoommatePosting | null> {
    const posting = await this.postings.findOne({ poster: posterId });
    return posting;
  }

  /**
   * Creates a new roommate posting
   *
   * @requires a roommatePosting with this poster does not already exist in set of roommatePostings
   * @effects creates and returns new posting with the given poster, city, gender, age, and description
   *
   * @param poster The user creating the posting
   * @param city The city where they're looking for housing
   * @param gender The poster's gender
   * @param age The poster's age
   * @param description Details about preferences and plans
   * @returns The newly created RoommatePosting or error if requirements not met
   */
  async create({ poster, city, gender, age, description }: { poster: ID; city: string; gender: Gender; age: number; description: string }): Promise<{ posting: RoommatePosting } | { error: string }> {
    // Check if poster already has a posting
    const existingPosting = await this.getPostingByPoster(poster);
    if (existingPosting) {
      return {
        error:
          `Create posting failed: User '${poster}' already has a roommate posting.`,
      };
    }

    const newPosting: RoommatePosting = {
      _id: freshID(),
      poster,
      city,
      gender,
      age,
      description,
    };

    await this.postings.insertOne(newPosting);
    return { posting: newPosting };
  }

  /**
   * Updates the city field of a roommate posting
   *
   * @requires a roommatePosting with this poster exists in set of roommatePostings
   * @effects updates the posting's city to the given city and returns the posting
   *
   * @param poster The user who owns the posting
   * @param city The new city value
   * @returns The updated RoommatePosting or error
   */
  async editCity(poster: ID, city: string): Promise<RoommatePosting | { error: string }> {
    const existingPosting = await this.getPostingByPoster(poster);

    if (!existingPosting) {
      return {
        error: `Edit city failed: No posting found for user '${poster}'.`,
      };
    }

    existingPosting.city = city;
    await this.postings.updateOne({ _id: existingPosting._id }, {
      $set: { city },
    });
    return { ...existingPosting };
  }

  /**
   * Updates the gender field of a roommate posting
   *
   * @requires a roomatePosting with this poster exists in set of roommatePostings
   * @effects updates the posting's gender to the given gender and returns the posting
   *
   * @param poster The user who owns the posting
   * @param gender The new gender value
   * @returns The updated RoommatePosting or error
   */
  async editGender(poster: ID, gender: Gender): Promise<RoommatePosting | { error: string }> {
    const existingPosting = await this.getPostingByPoster(poster);

    if (!existingPosting) {
      return {
        error: `Edit gender failed: No posting found for user '${poster}'.`,
      };
    }

    existingPosting.gender = gender;
    await this.postings.updateOne({ _id: existingPosting._id }, {
      $set: { gender },
    });
    return { ...existingPosting };
  }

  /**
   * Updates the age field of a roommate posting
   *
   * @requires a roomatePosting with this poster exists in set of roommatePostings
   * @effects  updates the posting's age to the given age and returns the posting
   *
   * @param poster The user who owns the posting
   * @param age The new age value
   * @returns The updated RoommatePosting or error
   */
  async editAge(poster: ID, age: number): Promise<RoommatePosting | { error: string }> {
    const existingPosting = await this.getPostingByPoster(poster);

    if (!existingPosting) {
      return {
        error: `Edit age failed: No posting found for user '${poster}'.`,
      };
    }

    existingPosting.age = age;
    await this.postings.updateOne({ _id: existingPosting._id }, {
      $set: { age },
    });
    return { ...existingPosting };
  }

  /**
   * Updates the description field of a roommate posting
   *
   * @requires  a roomatePosting with this poster exists in set of roommatePostings
   * @effects updates the posting's description to the given description and returns the posting
   *
   * @param poster The user who owns the posting
   * @param description The new description value
   * @returns The updated RoommatePosting or error
   */
  async editDescription(poster: ID,description: string): Promise<RoommatePosting | { error: string }> {
    const existingPosting = await this.getPostingByPoster(poster);

    if (!existingPosting) {
      return {
        error:
          `Edit description failed: No posting found for user '${poster}'.`,
      };
    }

    existingPosting.description = description;
    await this.postings.updateOne({ _id: existingPosting._id }, {
      $set: { description },
    });
    return { ...existingPosting };
  }

  /**
   * Deletes a roommate posting by its ID
   *
   * @requires posting exists
   * @effects deletes the posting from the set of roommatePostings
   *
   * @param postingId The ID of the posting to delete
   */
  async delete({ postingId }: { postingId: ID }): Promise<void> {
    await this.postings.deleteOne({ _id: postingId });
  }


  /**
   * Retrieves a posting by its ID
   * @param postingId The ID of the posting
   * @returns The posting if found, otherwise null
   */
  async getPostingById(postingId: ID): Promise<RoommatePosting | null> {
    const posting = await this.postings.findOne({ _id: postingId });
    return posting ? { ...posting } : null;
  }

  /**
   * Retrieves a posting by poster ID
   * 
   * @requires poster has a posting
   * @effects retrieves the posting for the given poster
   * 
   * @param posterId The ID of the poster
   * @returns The posting if found, otherwise null
   */
  async getPostingByPosterId(posterId: ID): Promise<RoommatePosting | null> {
    const posting = await this.postings.findOne({ poster: posterId });
    return posting ? { ...posting } : null;
  }

  /**
   * Retrieves all roommate postings
   *
   * @requires at least one posting exists
   * @effects returns all postings
   * 
   * @returns An array of all postings
   */
  async getAllPostings(): Promise<RoommatePosting[]> {
    const postings = await this.postings.find({}).toArray();
    return postings.map((p) => ({ ...p }));
  }

  /**
   * Retrieves postings filtered by city
   * 
   * @requires at least one posting exists with the given city
   * @effects returns the postings with that city or an error if no posts have that city
   * 
   * @param city The city to filter by
   * @returns An array of postings in the specified city
   */
  async getPostingsByCity(city: string): Promise<RoommatePosting[]> {
    const postings = await this.postings.find({ city }).toArray();
    return postings.map((p) => ({ ...p }));
  }

  /**
   * Retrieves postings filtered by age
   * 
   * @requires at least one posting exists with the given age
   * @effects returns the postings with that age or an error if no posts have that age
   * 
   * @param age The age to filter by
   * @returns An array of postings with the specified age
   */
  async getPostingsByAge(age: number): Promise<RoommatePosting[]> {
    const postings = await this.postings.find({ age }).toArray();
    return postings.map((p) => ({ ...p }));
  }

  /**
   * deletePostingsByPoster (poster: ID): (deletedPostings: {postingId: ID}[])
   * 
   * **requires** true
   * **effects** deletes all roommate postings for the given poster and returns the IDs of deleted postings
   */
  async deletePostingsByPoster({ poster }: { poster: ID }): Promise<{ deletedPostings: { postingId: ID }[] }> {
    // Get all posting IDs before deleting
    const postings = await this.postings.find({ poster }).toArray();
    const postingIds = postings.map(p => ({ postingId: p._id }));
    
    // Delete all postings in one operation
    await this.postings.deleteMany({ poster });
    
    return { deletedPostings: postingIds };
  }
}
