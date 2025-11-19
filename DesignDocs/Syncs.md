# Syncs

## Account Registration/Deletion

**sync** createUser
	**when** Requesting.createUser(username: String, password: String, emailAddress: String)
	**then** 
	PasswordAuth.register(username, password): (user)
	UserInfo.setInfo(user, emailAddress): (user)
	SavedItems.addUserRecord(user)
	NotificationConcept.createMessageBody(template: WelcomeTemplate, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

**sync** deleteUser
	**when** PasswordAuth.deleteAccount(username: String, password: String)
    **where** user is the user id associated with username
	**then** 
	SavedItems.deleteUserRecord(user)
	UserInfo.deleteInfo(user)

## Posting Listings/Roommate Posts
**sync** createListing
	**when** Listing.create(lister: User/ID): (newListing: Listing)
	**where** emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
	**then** 
	SavedItems.addItemTag(user: lister, item: newListing, tag: 'ownListing')
	NotificationConcept.createMessageBody(template: ListingCreated, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

**sync** deleteListing
	**when** Listing.delete(listing: Listing/ID)
	**where** user is any user with Listing in their set of SavedItems; emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
	**then** 
	SavedItems.removeItem(user, item: listing)
	NotificationConcept.createMessageBody(template: ListingDeleted, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)
	
**sync** createRoommatePost
	**when** RoommatePosting.create(poster: User/ID): (RoommatePosting)
	**where** emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
	**then** 
	SavedItems.addItemTag(user: poster, item: newListing, tag: 'ownRoommatePost')
	NotificationConcept.createMessageBody(template: RoommatePostMade, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

**sync** deleteRoommatePost
	**when** RoommatePosting.delete(posting: RoommatePosting/ID)
	**where** user is any user with posting in their set of SavedItems; emailAddress and username are associated with each user in the UserInfo and PasswordAuth concepts, respectively
	**then**
	SavedItems.removeItem(user, item: posting)
	NotificationConcept.createMessageBody(template: RoommatePostDeleted, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

## Applying For Posts/Listings
**sync** applyForListingAndNotifyLister
	**when** SavedItems.addItemTag(user, item: Listing, tag: 'applied')
	**where** lister is the user associated with this listing; email address and username are the ones associated with lister in the UserInfo and PasswordAuth concepts, respectively
	**then** 
	NotificationConcept.createMessageBody(template: ListingUserApplied, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

**sync** contactPotentialRoommate
	**when** SavedItems.addItemTag(user, item: posting, tag: 'contacted')
	**where** poster is the user associated with this posting; email address and username are the ones associated with poster in the UserInfo and PasswordAuth concepts, respectively
	**then** 
	NotificationConcept.createMessageBody(template: PotentialRoommateAlert, email: emailAddress, name: username): (message)
	NotificationConcept.sendMessage(message)

> Note 1: All message templates would be an associated string that is relevant to the template (ex. WelcomeTemplate would be a welcome email that explains general concept of site and confirms registration)
> 
> Note 2: All actions require authentication using the Sessioning and Requesting concepts to ensure that all creation, deletion, saving, etc. can only be done by the corresponding logged in, registered user. These syncs are not explicitly documented above but will be included.

> Note 3: Many of these syncs would be triggered by UI buttons and may be displayed differently, but for the purposes of this documentation begin at the concept level. For example, contacting a potential roommate would have different UI display than saving a post, but both would end up adding that post to SavedItems for a user. Thus, the sync for contactPotentialRoommate begins at SavedItems.

> Note 4: Requesting.createUser represents the registration action where a user would enter all their information. This was created so the then clause would have access to the needed arguments.