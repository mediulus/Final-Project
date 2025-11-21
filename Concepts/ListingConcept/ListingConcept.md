# Listing Concept

**concept** Listing
            
**purpose**  Represent a summer-housing listing posted by an MIT-affiliated lister, including address, availability window, pricing, amenities, and optional photos.

**principle** users can create a listing for their summers housing options so that other users can browse them and find housing easily

**state**

        a set of Listings with
            _id ID // unique identifier
            a title String
            a lister ID // this is the lister's _id
            amenities: {Amenity}
            photos {Photo} //unsure about the exact rep for this??
            an address String // would we want to post the address or wait till they reach out like airbnb?
            a startDate DateTime
            an endDate DateTime
            a price Number // we could do this differently like week by week or smth else (think it would be good to be consitent though)

               
            a set of Amenities with
                _id ID
                a title String
                a distance Number

**actions**

        create(lister: ID, amennities: {Amenity}, photos: {Photo}, address: String, startDate: DateTime, endDate: DateTime, price: Number): newListing: Listing
            requires:
                - no listing with this address on those dates exists
                - startDate < endDate
            effects: creates a new listing with the inputted attributes

        delete(_id: ID)
            requires: listing with this _id exists
            effects: deletes the listing

        deletePhoto(listing: ID, photo: ID): editedListing: Listing //unsure how photos are represented...
            requires:
                - listing exists
                - photo is in this listings photos
            effects: removes the photo from the listings photos attribute

        addPhoto(listing: ID, photo: ID): editedListing: Listing
            requires:
                - listing exists
                - photo is not in the listing
            effects: adds the photo to the listings photos attribute

        editAddress(listing: ID, newAddress: String): editedListing: Listing
            requires:
                - listing exists
                - another listing with the same startDate and EndDate does not exist with this address
            effects: changes the address to newAddress

        editStartDate(listing: ID, newStartDate: String): editedListing: Listing
            requires:
                - listing exists
                - another listing with the same address and EndDate does not exist with this startDate
                - startDate < endDate
            effects: changes the startDate to newStartDate

        editPrice(listing: Listing, newPrice: Number): editedListing: Listing
            requires: listing exists
            effects: changes the price to newPrice

        addAmenity(listing: ID, title: String, distance: Number):
            requires:
                - listing exists
                - amenity is not already in amenities
            effects: add the amenity to the amenities attribute

        deleteAmenity(listing: ID, amenity: ID)
            requires:
                - listing exists
                - amenity is part of the listing
            effects: removes amenity from amenities