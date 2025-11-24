---
timestamp: 'Sun Nov 23 2025 22:52:29 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251123_225229.5be47178.md]]'
content_id: 72c048cf7f72f7576a0e2d46d3667cce0a55b3da00db0f4282779289d09c972f
---

# API Specification: Listing Concept

**Purpose:** Manages the state and actions related to summer housing listings.

***

## API Endpoints

### POST /api/Listing/create

**Description:** Creates and registers a new summer housing listing.

**Requirements:**

* No listing with this address and for these dates exists.
* `startDate` must be strictly before `endDate`.

**Effects:**

* A new listing is created with the provided details.
* The newly created listing object is returned.

**Request Body:**

```json
{
  "lister": "string",
  "title": "string",
  "amenities": [
    {
      "_id": "string",
      "title": "string",
      "distance": "number"
    }
  ],
  "photos": [
    {
      "url": "string",
      "thumbUrl": "string",
      "storageKey": "string",
      "alt": "string",
      "width": "number",
      "height": "number",
      "contentType": "string",
      "bytes": "number"
    }
  ],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [
    {
      "_id": "string",
      "title": "string",
      "distance": "number"
    }
  ],
  "photos": [
    {
      "_id": "string",
      "url": "string",
      "thumbUrl": "string",
      "storageKey": "string",
      "alt": "string",
      "order": "number",
      "width": "number",
      "height": "number",
      "contentType": "string",
      "bytes": "number",
      "createdAt": "string (ISO 8601 format)"
    }
  ],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/delete

**Description:** Deletes an existing listing by its ID.

**Requirements:**

* A listing with the given `listingId` must exist.

**Effects:**

* The specified listing is permanently removed from the system.

**Request Body:**

```json
{
  "listingId": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/deletePhoto

**Description:** Removes a photo from a specific listing.

**Requirements:**

* The listing with `listingId` must exist.
* A photo with `photoId` must be present in the listing's photos.

**Effects:**

* The specified photo is removed from the listing's photos array.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "photoId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/addPhoto

**Description:** Adds a new photo to a specific listing.

**Requirements:**

* The listing with `listingId` must exist.
* The photo (identified by its URL) must not already be in the listing.

**Effects:**

* The new photo is added to the listing's photos array.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "photo": {
    "url": "string",
    "thumbUrl": "string",
    "storageKey": "string",
    "alt": "string",
    "width": "number",
    "height": "number",
    "contentType": "string",
    "bytes": "number"
  }
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [
    {
      "_id": "string",
      "url": "string",
      "thumbUrl": "string",
      "storageKey": "string",
      "alt": "string",
      "order": "number",
      "width": "number",
      "height": "number",
      "contentType": "string",
      "bytes": "number",
      "createdAt": "string (ISO 8601 format)"
    }
  ],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/editTitle

**Description:** Changes the title of a listing.

**Requirements:**

* The listing with `listingId` must exist.

**Effects:**

* The listing's title is updated to `newTitle`.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "newTitle": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/editAddress

**Description:** Changes the address of a listing.

**Requirements:**

* The listing with `listingId` must exist.
* No other listing with the `newAddress` can have date ranges that overlap with this listing.

**Effects:**

* The listing's address is updated to `newAddress`.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "newAddress": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/editStartDate

**Description:** Changes the start date of a listing.

**Requirements:**

* The listing with `listingId` must exist.
* The `newStartDate` must be strictly before the listing's current `endDate`.
* No other listing with the same address can have date ranges that overlap with the new date range.

**Effects:**

* The listing's start date is updated to `newStartDate`.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "newStartDate": "string (ISO 8601 format)"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/editEndDate

**Description:** Changes the end date of a listing.

**Requirements:**

* The listing with `listingId` must exist.
* The listing's current `startDate` must be strictly before the `newEndDate`.
* No other listing with the same address can have date ranges that overlap with the new date range.

**Effects:**

* The listing's end date is updated to `newEndDate`.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "newEndDate": "string (ISO 8601 format)"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/editPrice

**Description:** Changes the price of a listing.

**Requirements:**

* The listing with `listingId` must exist.
* The `newPrice` must not be negative.

**Effects:**

* The listing's price is updated to `newPrice`.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "newPrice": "number"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/addAmenity

**Description:** Adds a new amenity to a listing.

**Requirements:**

* The listing with `listingId` must exist.
* An amenity with the same `title` and `distance` must not already exist in the listing.

**Effects:**

* A new amenity is created and added to the listing's amenities array.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "title": "string",
  "distance": "number"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [
    {
      "_id": "string",
      "title": "string",
      "distance": "number"
    }
  ],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/deleteAmenity

**Description:** Deletes an amenity from a listing by its ID.

**Requirements:**

* The listing with `listingId` must exist.
* An amenity with `amenityId` must be part of the listing.

**Effects:**

* The specified amenity is removed from the listing's amenities array.
* The updated listing object is returned.

**Request Body:**

```json
{
  "listingId": "string",
  "amenityId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "title": "string",
  "lister": "string",
  "amenities": [],
  "photos": [],
  "address": "string",
  "startDate": "string (ISO 8601 format)",
  "endDate": "string (ISO 8601 format)",
  "price": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/getListingById

**Description:** Retrieves a single listing by its unique ID.

**Requirements:**

* None.

**Effects:**

* Returns an array containing the matching listing, or an empty array if not found.

**Request Body:**

```json
{
  "listingId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "title": "string",
    "lister": "string",
    "amenities": [],
    "photos": [],
    "address": "string",
    "startDate": "string (ISO 8601 format)",
    "endDate": "string (ISO 8601 format)",
    "price": "number"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Listing/getAllListings

**Description:** Retrieves all current listings in the system.

**Requirements:**

* None.

**Effects:**

* Returns an array of all listing objects.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "title": "string",
    "lister": "string",
    "amenities": [],
    "photos": [],
    "address": "string",
    "startDate": "string (ISO 8601 format)",
    "endDate": "string (ISO 8601 format)",
    "price": "number"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
