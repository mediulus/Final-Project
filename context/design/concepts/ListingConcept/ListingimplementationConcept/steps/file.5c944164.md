---
timestamp: 'Fri Nov 21 2025 15:04:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251121_150454.7e97e678.md]]'
content_id: 5c944164683c42b808541be039f5300647681ee2176f3e4f958cf71be84fedf6
---

# file: design/concepts/ListingConcept/ListingimplementationConcept

```
[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

# implement: ListingConcept

# Listing Concept

**concept** Listing

**purpose**  represent a summer-housing listing posted by an MIT-affiliated lister, including address, availability window, pricing, amenities, and photos

**principle** after a user creates a listing for their summer housing options, other users can browse listings to find housing easily

**state**

        a set of Listings with
            _id ID
            a title String
            a lister User
            a set of Amenities
            a photos set of Images
            an address String // post the address or wait until they reach out?
            a startDate DateTime
            an endDate DateTime
            a price Number // could be week by week or something else - good to be consitent


        a set of Amenities with
            _id ID
            a title String
            a distance Number

**actions**

        create(lister: User, amenities: set of Amenities, photos: set of Images, address: String, startDate: DateTime, endDate: DateTime, price: Number) : (newListing: Listing)
            requires:
                - no listing with this address and for these dates exists
                - startDate < endDate
            effects: creates and returns a new listing with the given lister, amenities, photos, address, startDate, endDate, and price

        delete(_id: ID)
            requires: listing with this _id exists
            effects: deletes the listing from the set of listings

        deletePhoto(listing: ID, photo: Image) : (editedListing: Listing)
            requires:
                - listing exists
                - photo is in this listing's photos
            effects: removes the photo from the listing's photos attribute and returns listing

        addPhoto(listing: ID, photo: Image) : (editedListing: Listing)
            requires:
                - listing exists
                - photo is not in the listing
            effects: adds the photo to the listings photos attribute and returns listing

        editTitle(listing: ID, newTitle: String) : (editedListing: Listing)
            requires:
                - listing exists
            effects: changes the title to newTitle and returns listing

        editAddress(listing: ID, newAddress: String) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same startDate and EndDate does not exist with this address
            effects: changes the address to newAddress and returns listing

        editStartDate(listing: ID, newStartDate: DateTime) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same address and EndDate does not exist with this startDate
                - startDate < endDate
            effects: changes the startDate to newStartDate and returns listing

        editEndDate(listing: ID, newEndDate: DateTime) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same address and StartDate does not exist with this endDate
                - startDate < endDate
            effects: changes the endDate to newEndDate and returns listing

        editPrice(listing: ID, newPrice: Number) : (editedListing: Listing)
            requires: listing exists
            effects: changes the price to newPrice and returns listing

        addAmenity(listing: ID, title: String, distance: Number)
            requires:
                - listing exists
                - amenity is not already in amenities
            effects: add the amenity to the amenities attribute

        deleteAmenity(listing: ID, amenity: ID)
            requires:
                - listing exists
                - amenity is part of the listing
            effects: removes amenity from amenities

```
