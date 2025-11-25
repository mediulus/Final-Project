import { Collection, Db } from "npm:mongodb";
import { ID, } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Listing" + "."; 
/**
 * Represents an image associated with a listing.
 */
interface Image {
  _id: ID;                 // stable id for this photo inside the listing
  url: string;             // full-size, CDN/public URL
  thumbUrl?: string;       // optional smaller version for fast rendering
  storageKey?: string;     // optional: internal key in your bucket
  alt?: string;            // accessibility / caption
  order: number;           // explicit ordering in the UI
  width?: number;
  height?: number;
  contentType?: string;    // "image/jpeg", etc.
  bytes?: number;          // size in bytes
  createdAt: Date;
}

type NewPhoto = {
  url: string;
  thumbUrl?: string;
  storageKey?: string;
  alt?: string;
  width?: number;
  height?: number;
  contentType?: string;
  bytes?: number;
};

/**
 * Represents an amenity available for a listing.
 * As per the concept, amenities are created specific to a listing
 * with a title and a distance (e.g., distance from the listing).
 */
interface Amenity {
  _id: ID;
  title: string;
  distance: number; // e.g., distance in miles/km from MIT or another reference point
}

/**
 * Represents a summer-housing listing.
 */
export interface Listing {
  _id: ID;
  title: string;
  lister: ID;
  amenities: Amenity[];
  photos: Image[];
  address: string;
  startDate: Date;
  endDate: Date;
  price: number; // price per week
}

/**
 * Manages the state and actions related to summer housing listings.
 */
export default class ListingConcept {
  // A private map to store listings, keyed by their unique ID for efficient lookup.
  private listings: Collection<Listing>;

  constructor(private readonly db: Db) {
    this.listings = this.db.collection(PREFIX + "posts");
  }

  /**
   * Internal helper to retrieve a listing by its ID, throwing an error if not found.
   * @param listingId The ID of the listing to retrieve.
   * @returns The found Listing object or error if listing does not exist
   *
   */
  private async getListing(listingId: ID): Promise<Listing | { error: string }> {
    const listing = await this.listings.findOne({ _id: listingId });
    
    if (!listing) {
      return {error : `Listing with ID '${listingId}' not found.`};
    } else {
      return listing;
    }
  }

  /**
   * Checks for conflicts (overlapping address and dates) with existing listings.
   * @param address The address to check.
   * @param startDate The start date to check.
   * @param endDate The end date to check.
   * @param excludeListingId Optional ID of a listing to exclude from the conflict check (useful during edits).
   * @returns True if a conflict exists, false otherwise.
   */
  private async isListingConflict(listing: Listing): Promise<boolean | {error: string}> {
    // Query for all listings with the same address
    const existingListings = await this.listings.find({
      address: listing.address,
      _id: { $ne: listing._id } // Exclude the current listing itself
    }).toArray();

    // Check if any existing listing has overlapping dates
    for (const existingListing of existingListings) {
      // Two date ranges overlap if: start1 < end2 AND start2 < end1
      const datesOverlap = listing.startDate < existingListing.endDate && 
                          existingListing.startDate < listing.endDate;
      
      if (datesOverlap) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }


  /**
   * Creates and registers a new summer housing listing.
   * 
   * @requires no listing with this address and for these dates exists
   * @requires startDate < endDate
   * 
   * @param lister The user posting the listing.
   * @param amenities A set of amenities for the listing.
   * @param title The title of the listing.
   * @param photos A set of photos for the listing.
   * @param address The physical address of the housing.
   * @param startDate The start date of availability.
   * @param endDate The end date of availability.
   * @param price The price of the listing.
   * @returns The newly created Listing.
   * @returns Error if creation requirements are not met (e.g., date order, address/date conflict).
   */
  async create({ lister, title, amenities, photos, address, startDate, endDate, price }: { lister: ID; title: string; amenities: Amenity[]; photos: NewPhoto[]; address: string; startDate: Date | string; endDate: Date | string; price: number }): Promise<{ listing: Listing } | { error: string }> {
    console.log("Creating listing with lister:", lister);
    // Convert string dates to Date objects if needed
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    if (start >= end) {
      return { error: "Create listing failed: Start date must be strictly before end date." };
    }

    const normalizedPhotos: Image[] = photos.map((p, i) => ({
      _id: freshID(),
      url: p.url,
      thumbUrl: p.thumbUrl,
      storageKey: p.storageKey,
      alt: p.alt,
      order: i,
      width: p.width,
      height: p.height,
      contentType: p.contentType,
      bytes: p.bytes,
      createdAt: new Date(),
    }));

    const newListing: Listing = {
      _id: freshID(),
      title,
      lister,
      amenities,
      photos: normalizedPhotos,
      address,
      startDate: start,
      endDate: end,
      price,
    };

    const conflict = await this.isListingConflict(newListing);
    if (conflict) {
      return { error: `Create listing failed: Another listing with address '${address}' overlaps with the specified dates.` };
    }

    await this.listings.insertOne(newListing);
    return { listing: newListing };
  }


  /**
   * Deletes an existing listing by its ID.\
   * 
   * @requires listing with this id exists
   * @effects  deletes the listing from the set of listings
   *
   * @param id The ID of the listing to delete.
   * @throws Error if the listing does not exist.
   */
  async delete({ listingId }: { listingId: ID }): Promise<void> {
    console.log("Deleting listing with ID:", listingId);
    await this.listings.deleteOne({ _id: listingId });
  }

  /**
   * Removes a photo from a listing.
   * 
   * @requires listing exists
   * @requires photo is in this listing's photos
   * @effects removes the photo from the listing's photos attribute and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param photoId The ID of the photo to remove.
   * @returns The updated Listing.
   * @throws Error if the listing or photo does not exist within the listing.
   */
  async deletePhoto(listingId: ID, photoId: ID): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId);
    if ("error" in listingOrError) return listingOrError;
    const listing = listingOrError;

    const before = listing.photos.length;
    listing.photos = listing.photos.filter(p => p._id !== photoId);

    if (listing.photos.length === before) {
      return { error: `Delete photo failed: Photo '${photoId}' not found in listing '${listingId}'.` };
    }

    // re-pack order
    listing.photos
      .sort((a, b) => a.order - b.order)
      .forEach((p, i) => (p.order = i));

    await this.listings.updateOne(
      { _id: listingId },
      { $set: { photos: listing.photos } }
    );

    return { ...listing };
}


  /**
   * Adds a new photo to a listing.
   * 
   * @requires listing exists
   * @requires photo is not in the listing
   * @effects adds the photo to the listings photos attribute and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param photo The Image object to add.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or the photo is already present.
   */
  async addPhoto(listingId: ID, photo: NewPhoto): Promise<Listing | { error: string }> {
  const listingOrError = await this.getListing(listingId);
  if ("error" in listingOrError) return listingOrError;
  const listing = listingOrError;

  // uniqueness by url (or storageKey if you prefer)
  if (listing.photos.some(p => p.url === photo.url)) {
    return { error: `Add photo failed: URL '${photo.url}' already exists in listing '${listingId}'.` };
  }

  const nextOrder =
    listing.photos.length === 0
      ? 0
      : Math.max(...listing.photos.map(p => p.order ?? 0)) + 1;

  const newImage: Image = {
    _id: freshID(),
    url: photo.url,
    thumbUrl: photo.thumbUrl,
    storageKey: photo.storageKey,
    alt: photo.alt,
    order: nextOrder,
    width: photo.width,
    height: photo.height,
    contentType: photo.contentType,
    bytes: photo.bytes,
    createdAt: new Date(),
  };

  listing.photos.push(newImage);

  await this.listings.updateOne(
    { _id: listingId },
    { $set: { photos: listing.photos } }
  );

  return { ...listing };
}

  /**
   * Changes the title of a listing.
   * 
   * @requires listing exists
   * @effects changes the title to newTitle and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param newTitle The new title for the listing.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist.
   */
  async editTitle(listingId: ID, newTitle: string): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;
    listing.title = newTitle;
    await this.listings.updateOne({ _id: listingId }, { $set: { title: newTitle } });
    return { ...listing };
  }

  /**
   * Changes the address of a listing.
   * @requires listing exists
   * @requires  another listing with the same startDate and EndDate does not exist with this address
   * @effects changes the address to newAddress and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param newAddress The new address for the listing.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or if the new address causes a conflict.
   */
  async editAddress(listingId: ID, newAddress: string): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;

    // Create a modified listing with the new address to check for conflicts
    const modifiedListing = { ...listing, address: newAddress };
    const conflict = await this.isListingConflict(modifiedListing);

    if (conflict) {
      return { error: `Edit address failed: Another listing with address '${newAddress}' overlaps with the current listing's dates.` };
    }

    listing.address = newAddress;
    await this.listings.updateOne({ _id: listingId }, { $set: { address: newAddress } });
    return { ...listing };
  }

  /**
   * Changes the start date of a listing.
   * 
   * @requires listing exists
   * @requires startDate < endDate
   * @requires another listing with the same address and EndDate does not exist with this startDate
   * @effects changes the startDate to newStartDate and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param newStartDate The new start date for the listing.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or if the new start date causes a conflict or is invalid.
   */
  async editStartDate(listingId: ID, newStartDate: Date): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;

    // Requires: startDate < endDate
    if (newStartDate >= listing.endDate) {
      return { error: 'Edit start date failed: New start date must be strictly before the current end date.' };
    }
    
    // Requires: another listing with the same address and EndDate does not exist with this startDate
    const modifiedListing = { ...listing, startDate: newStartDate };
    const conflict = await this.isListingConflict(modifiedListing);
    
    if (conflict) {
      return { error: `Edit start date failed: Another listing with the same address overlaps with the new start date and current end date.` };
    }

    listing.startDate = newStartDate;
    await this.listings.updateOne({ _id: listingId }, { $set: { startDate: newStartDate } });
    return { ...listing };
  }

  /**
   * Changes the end date of a listing.
   * 
   * @requires listing exists
   * @requires startDate < endDate
   * @requires another listing with the same address and EndDate does not exist with this startDate
   * @effects changes the endDate to newEndDate and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param newEndDate The new end date for the listing.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or if the new end date causes a conflict or is invalid.
   */
  async editEndDate(listingId: ID, newEndDate: Date): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;

    // Requires: startDate < endDate
    if (listing.startDate >= newEndDate) {
      return { error: 'Edit end date failed: Current start date must be strictly before the new end date.' };
    }
    
    // Requires: another listing with the same address and StartDate does not exist with this endDate
    const modifiedListing = { ...listing, endDate: newEndDate };
    const conflict = await this.isListingConflict(modifiedListing);
    
    if (conflict) {
      return { error: `Edit end date failed: Another listing with the same address overlaps with the current start date and new end date.` };
    }

    listing.endDate = newEndDate;
    await this.listings.updateOne({ _id: listingId }, { $set: { endDate: newEndDate } });
    return { ...listing };
  }

  /**
   * Changes the price of a listing.
   * 
   * @requires listing exists
   * @effects changes the price to newPrice and returns listing
   * 
   * @param listingId The ID of the listing to modify.
   * @param newPrice The new price for the listing.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or if the price is invalid (e.g., negative).
   */
  async editPrice(listingId: ID, newPrice: number): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;
    if (newPrice < 0) {
        return { error: 'Edit price failed: Price cannot be negative.' };
    }
    listing.price = newPrice;
    await this.listings.updateOne({ _id: listingId }, { $set: { price: newPrice } });
    return { ...listing };
  }

  /**
   * Adds a new amenity to a listing. This creates a new Amenity instance specific to the listing.
   * 
   * @requires listing exists
   * @requires amenity is not already in amenities
   * @effects add the amenity to the amenities attribute
   * 
   * @param listingId The ID of the listing to modify.
   * @param title The title of the amenity.
   * @param distance The distance associated with the amenity.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or an identical amenity already exists in the listing.
   */
  async addAmenity(listingId: ID, title: string, distance: number): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;

    // Requires: amenity is not already in amenities (check by title and distance)
    if (listing.amenities.some((a: Amenity) => a.title === title && a.distance === distance)) {
      return { error: `Add amenity failed: Amenity '${title}' with distance '${distance}' already exists in listing '${listingId}'.` };
    }

    const newAmenity: Amenity = {
      _id: freshID(), // Generate a unique ID for this amenity instance
      title,
      distance,
    };
    listing.amenities.push(newAmenity);
    await this.listings.updateOne({ _id: listingId }, { $set: { amenities: listing.amenities } });
    return { ...listing };
  }

  /**
   * Deletes an amenity from a listing by its ID.
   * @requires listing exists
   * @requires amenity is part of the listing
   * @effects removes amenity from amenities
   * 
   * @param listingId The ID of the listing to modify.
   * @param amenityId The ID of the amenity to remove.
   * @returns The updated Listing.
   * @throws Error if the listing does not exist or the amenity is not part of the listing.
   */
  async deleteAmenity(listingId: ID, amenityId: ID): Promise<Listing | { error: string }> {
    const listingOrError = await this.getListing(listingId); // Requires: listing exists
    
    if ('error' in listingOrError) {
      return listingOrError;
    }
    
    const listing = listingOrError;

    const initialAmenityCount = listing.amenities.length;
    listing.amenities = listing.amenities.filter((a: Amenity) => a._id !== amenityId);

    // Requires: amenity is part of the listing
    if (listing.amenities.length === initialAmenityCount) {
      return { error: `Delete amenity failed: Amenity with ID '${amenityId}' not found in listing '${listingId}'.` };
    }

    await this.listings.updateOne({ _id: listingId }, { $set: { amenities: listing.amenities } });
    return { ...listing };
  }


  /**
   * Retrieves a listing by its ID.
   * @param listingId The ID of the listing.
   * @returns The listing if found, otherwise undefined. Returns a shallow copy.
   */
  async getListingById(listingId: ID): Promise<Listing | null> {
    const listing = await this.listings.findOne({ _id: listingId });
    return listing ? { ...listing } : null;
  }

  /**
   * Retrieves all current listings.
   * @returns An array of all listings. Returns shallow copies.
   */
  async getAllListings(): Promise<Listing[]> {
    const listings = await this.listings.find({}).toArray();
    return listings.map(l => ({ ...l }));
  }

  /**
   * _getListingsByLister (lister: ID): (listing: {listingId: ID})
   * 
   * **requires** at least one listing exists for the given lister
   * **effects** returns all listing IDs for the given lister
   */
  async _getListingsByLister({ lister }: { lister: ID }): Promise<{ listing: { listingId: ID } }[]> {
    const listings = await this.listings.find({ lister }).toArray();
    return listings.map(l => ({ listing: { listingId: l._id } }));
  }

  /**
   * deleteListingsByLister (lister: ID): (deletedListings: {listingId: ID}[])
   * 
   * **requires** true
   * **effects** deletes all listings for the given lister and returns the IDs of deleted listings
   */
  async deleteListingsByLister({ lister }: { lister: ID }): Promise<{ deletedListings: { listingId: ID }[] }> {
    // Get all listing IDs before deleting
    const listings = await this.listings.find({ lister }).toArray();
    const listingIds = listings.map(l => ({ listingId: l._id }));
    
    // Delete all listings in one operation
    await this.listings.deleteMany({ lister });
    
    return { deletedListings: listingIds };
  }
}