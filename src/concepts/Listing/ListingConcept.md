# Listing Concept

**concept** Listing

**purpose**  represent a summer-housing listing posted by an MIT-affiliated lister, including address, availability window, pricing, amenities, and photos

**principle** after a user creates a listing for their summer housing options, other users can browse listings to find housing easily

**state**

        a set of Listings with
            a title String
            a lister ID
            a set of Amenities
            a photos set of Images
            an address String // post the address or wait until they reach out?
            a startDate DateTime
            an endDate DateTime
            a price Number // could be week by week or something else - good to be consitent


        a set of Amenities with
            a title String
            a distance Number

**actions**

        create(lister: User, amenities: set of Amenities, title: string, photos: set of Images, address: String, startDate: DateTime, endDate: DateTime, price: Number) : (newListing: Listing)
            requires:
                - no listing with this address and for these dates exists
                - startDate < endDate
            effects: creates and returns a new listing with the given lister, amenities, photos, address, startDate, endDate, and price

        delete(listing: Listing)
            requires: listing with this _id exists
            effects: deletes the listing from the set of listings

        deletePhoto(listing: Listing, photo: Image) : (editedListing: Listing)
            requires:
                - listing exists
                - photo is in this listing's photos
            effects: removes the photo from the listing's photos attribute and returns listing

        addPhoto(listing: Listing, photo: Image) : (editedListing: Listing)
            requires:
                - listing exists
                - photo is not in the listing
            effects: adds the photo to the listings photos attribute and returns listing

        editTitle(listing: Listing, newTitle: String) : (editedListing: Listing)
            requires:
                - listing exists
            effects: changes the title to newTitle and returns listing

        editAddress(listing: Listing, newAddress: String) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same startDate and EndDate does not exist with this address
            effects: changes the address to newAddress and returns listing

        editStartDate(listing: Listing, newStartDate: DateTime) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same address and EndDate does not exist with this startDate
                - startDate < endDate
            effects: changes the startDate to newStartDate and returns listing

        editEndDate(listing: Listing, newEndDate: DateTime) : (editedListing: Listing)
            requires:
                - listing exists
                - another listing with the same address and StartDate does not exist with this endDate
                - startDate < endDate
            effects: changes the endDate to newEndDate and returns listing

        editPrice(listing: Listing, newPrice: Number) : (editedListing: Listing)
            requires: listing exists
            effects: changes the price to newPrice and returns listing

        addAmenity(listing: Listing, title: String, distance: Number)
            requires:
                - listing exists
                - amenity is not already in amenities
            effects: add the amenity to the amenities attribute

        deleteAmenity(listing: Listing, amenity: ID)
            requires:
                - listing exists
                - amenity is part of the listing
            effects: removes amenity from amenities

        _getListingsByLister(lister: ID) : Listing[]
            requires: at least one listing exists for the given lister
            effects:  returns all listing IDs for the given lister

        deleteListingsByLister(lister: ID)
            requires:  at least one listing exists for the given lister
            effects: deletes all listings for the given lister


**Syncs**

    sync CreateListingRequest
      when
          Requesting.request (path: "/Listing/create", session, title, amenities, photos, address, startDate, endDate, price) : (request)
      where
          in Sessioning: user is associated with session
      then
          Listing.create (lister: user, title, amenities, photos, address, startDate, endDate, price)


    sync CreateListingResponseSuccess
      when
          Requesting.request (path: "/Listing/create") : (request)
          Listing.create () : (listing)
      then
          Requesting.respond (request, listing)


    sync CreateListingResponseError
      when
          Requesting.request (path: "/Listing/create") : (request)
          Listing.create () : (error)
      then
          Requesting.respond (request, error)


    sync DeleteListingRequest
      when
          Requesting.request (path: "/Listing/delete", session, listingId) : (request)
      where
          in Sessioning: user is associated with session
      then
          Listing.delete (listingId)


    sync DeleteListingResponse
      when
          Requesting.request (path: "/Listing/delete", listingId) : (request)
          Listing.delete (listingId) : ()
      then
          Requesting.respond (request, status: "deleted", listingId)


    sync RemoveListingFromSavedItems
      when
          Listing.delete (listingId) : ()
      where
          in SavedItems: user has saved item matching listingId
      then
          SavedItems.removeItem (user, item: listingId)
