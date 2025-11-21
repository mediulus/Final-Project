# Syncs

## Account Registration/Deletion

**sync** createUser <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    **when** Requesting.createUser(username: String, password: String, emailAddress: String)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    **then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    PasswordAuth.register(username, password): (user)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    UserInfo.setInfo(user, emailAddress): (user)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    SavedItems.addUserRecord(user)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Notification.createMessageBody(template: WelcomeTemplate, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Notification.sendMessage(message)

**sync** deleteUser <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** PasswordAuth.deleteAccount(username: String, password: String)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    **where** user is the user id associated with username
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	SavedItems.deleteUserRecord(user)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	UserInfo.deleteInfo(user)

## Posting Listings/Roommate Posts
**sync** createListing <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** Listing.create(lister: User): (newListing: Listing)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	SavedItems.addItemTag(user: lister, item: newListing, tag: 'ownListing')
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: ListingCreated, email:
    emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

**sync** deleteListing <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** Listing.delete(listing: Listing)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** user is any user with Listing in their set of SavedItems; emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	SavedItems.removeItem(user, item: listing)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: ListingDeleted, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

**sync** createRoommatePost<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** RoommatePosting.create(poster: User): (RoommatePosting)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** emailAddress and username are associated with user in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	SavedItems.addItemTag(user: poster, item: newListing, tag: 'ownRoommatePost')
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: RoommatePostMade, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

**sync** deleteRoommatePost <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** RoommatePosting.delete(posting: RoommatePosting)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** user is any user with posting in their set of SavedItems; emailAddress and username are associated with each user in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	SavedItems.removeItem(user, item: posting)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: RoommatePostDeleted, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

## Applying For Posts/Listings
**sync** applyForListingAndNotifyLister <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** SavedItems.addItemTag(user, item: Listing, tag: 'applied')
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** lister is the user associated with this listing; email address and username are the ones associated with lister in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: ListingUserApplied, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

**sync** contactPotentialRoommate <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**when** SavedItems.addItemTag(user, item: posting, tag: 'contacted')
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**where** poster is the user associated with this posting; email address and username are the ones associated with poster in the UserInfo and PasswordAuth concepts, respectively
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	**then**
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.createMessageBody(template: PotentialRoommateAlert, email: emailAddress, name: username): (message)
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	Notification.sendMessage(message)

> Note 1: All message templates would be an associated string that is relevant to the template (ex. WelcomeTemplate would be a welcome email that explains general concept of site and confirms registration)
>
> Note 2: All actions require authentication using the Sessioning and Requesting concepts to ensure that all creation, deletion, saving, etc. can only be done by the corresponding logged in, registered user. These syncs are not explicitly documented above but will be included.

> Note 3: Many of these syncs would be triggered by UI buttons and may be displayed differently, but for the purposes of this documentation begin at the concept level. For example, contacting a potential roommate would have different UI display than saving a post, but both would end up adding that post to SavedItems for a user. Thus, the sync for contactPotentialRoommate begins at SavedItems.

> Note 4: Requesting.createUser represents the registration action where a user would enter all their information. This was created so the then clause would have access to the needed arguments.
