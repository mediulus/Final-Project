# Alpha Checkpoint Submission
## Public URL
Public Link: [https://damgoodhousing.onrender.com/login](https://damgoodhousing.onrender.com/login)

## Screen Recording
[Video Link](https://youtu.be/PWVpvZ8K4rs)

## Updated Development Plan

| Feature                               | Lead       | Date   | Notes                                                                 |
|---------------------------------------|------------|--------|------------------------------------------------------------------------|
| ~~Concept Specs Completed~~               | ~~All, divided~~ | ~~11/18~~ |                                                                        |
| ~~Sync Specs Completed~~                  | ~~Christina~~  | ~~11/18~~ |                                                                        |
| ~~Database Initialization~~               |~~Camila~~| ~~11/19~~ | ~~Startup MongoDB Database~~                                               |
| ~~Concept Implementations (below)~~       |~~All, divided~~| ~~11/21~~ |                                                                        |
| ~~UserConcept~~                           |~~Kailey~~| ~~11/21~~ |                                                                        |
| ~~UserAuthConcept~~                       |~~Christina~~| ~~11/21~~ |                                                                        |
| ~~RoomatePostingConcept~~                 |~~Meg~~| ~~11/21~~ |                                                                        |
| ~~NotificationConcept~~                   |~~Camila~~| ~~11/21~~ |                                                                        |
| ~~SavedItems/StatusItemsConcept~~         |~~Christina~~| ~~11/21~~ |                                                                        |
| ~~API Spec for Backend~~                  |~~Kailey~~| ~~11/22~~ |                                                                        |
| ~~Frontend Skeleton~~                     |~~All~~| ~~11/22~~ |
| ~~Sync Implementation~~                   |~~All~~| ~~11/28 ~~|                                                                        |
| ~~Render Static Site Hosting~~            |~~Christina~~| ~~12~~/1  |                                                                                                                                     |
| **Checkpoint Alpha**                  |All| 11/25 | Have completed: Concept Specs, Sync Specs, Concept Implementations, Sync Implementations, Backend Completed, Frontend Skeleton |
| ReviewingConcept Implementation                 |Kailey| 11/27 |               |
| Google Maps Viewport                  |Camila| 11/27 |               |
| Frontend Customization                |Camila, Meg| 11/28 | App-specific and visual-design specific components                     |
| Team Member Testing and Observations  |Individual| 11/28 | Follow variations of user journeys and edge cases, take notes of what works and what doesn’t. |
| **Checkpoint Beta**                   |All| 12/2  | Should have completed: A working application, reflects visual design study, maintained document of design choices/changes, correct server & notification updates, site hosted on public URL |
| Team Member Testing and Observations  |Individual| 12/3  | Follow variations of user journeys and edge cases, take notes of what works and what doesn’t. |
| **User Testing**                          |All| 12/7  |                                                                        |
| Team Member Testing and Observations  |Individual| 12/8  | Follow variations of user journeys and edge cases, take notes of what works and what doesn’t. |
| **Full Demo**                             |All| 12/9  |                                                                        |
| **Project Report**                    |All | 12/9  | Final versions: source code, design documents, concept specs, mentoring meeting records; additionally: design summary, individual reflections |

## Key Risks Moving Forward
- *Implementing the Google Maps API* -  Ensuring addresses are valid, and size formatting are the primary concerns for implementing the Google Maps API.
- - Mitigate: Google maps provides robust API documentation. First mitigating step would be to correct / autocomplete addresses using a Google Maps API, or to confirm with the poster that the location is where was intended.
- - Fallback:  This is not a required feature for the functionality of our app, but we consider it a helpful tool. A valid fallback would be to create the saved list of Google Maps locations, and export to Google maps itself.

Per concept: Progress, what remains to be done, and how plans have changed.

### PasswordAuthConcept
#### Progress:
- Added syncs with Notification concept to email users upon registration, password change, and account deletion
- Syncs with UserInfo concept to create and login users
- Syncs with Listing concept to post and delete listings
- Added syncs with sessioning for general security for new users and logins
#### Future Steps:
- For scope of this project, concept completed
- Ensure that is compatible with front end and maintains reasonable amount of security
#### Changes:
- Delete account now returns the user upon completion
- Additional queries for syncs to get the user and username given username and user, respectively 
### ListingConcept
#### Progress:
- Syncs with sessioning to get the user
- Syncs with saved items to remove upon deletion
#### Future Steps:
- Implementing Map view may require updates to the concept
- Add images in the frontEnd
#### Changes:
- Added _getListingsByLister action and deleteListingsByLister to support syncs and front end compatibility 

### RoommatePostingConcept
#### Progress:
- Syncs with sessioning to get the user
- Syncs with saved items to remove them upon deletion
#### Future Steps:
- For the scope of this project, this concept is complete. Will keep an open mind with iterations throughout front end development 
#### Changes:
- Added deletePostingsByPoster action
- Added getPosterByPostingID action## RoommatePosting Concept

### NotificationConcept
#### Progress:
- Connected Google Mail API to send emails from dam.good.housing@gmail.com
- Created message body templates for different actions
- Connected Notification with other concepts through syncs, implemented actions include emailing registration confirmation, and emailing when a saved post has been removed or updated
#### Future Steps:
- Better format the message body templates to more accurately reflect intention and information updates
- Add Contact Me button connection to listing items that sends interest email to original poster
#### Changes:
- Added automatic “Contacted” tagging to posts where a user has pushed the ‘Contact Me’ or “Send Interest’ so these posts will appear in Favorites and can be kept track of.
- Added SubjectOverride param to createMessageBody -> if provided, it will be subject, otherwise generic

### SavedItemsConcept
#### Progress:
- Added general ‘Favorites’ tag toggle to RoommateListing and Housing views 
- Updated the Favorites view to display all saved items in a user’s profile
- Syncs with sessioning (ensure only user of session can see/modify own favorited items, etc)
- Syncs for deletion of a listing, posting that would also delete from users saved items
#### Future Steps:
- Include the ability to assign other tags, organized within the Favorites view
- Update SavedItems tags automatically once a user applies, as well as when the start date for the housing has past
- Syncs with notification for applied posts/contacted roommates
#### Changes:
- Concept remained the same other than additional queries for syncs

### SessioningConcept
#### Progress:
- Most syncs with other concepts implemented.
#### Future Steps:
- No planned future steps.
#### Changes:
- Most API calls now require session tokens to authenticate the user request

### ReviewingConcept
#### Progress:
- Created standard syncs (request, success, error) for all actions
- Syncs exist to delete all of a user’s reviews when the user is deleted and to delete all of a posting’s reviews when a posting is deleted 
#### Future Steps:
- Implement reviewing in the frontend: add the ability to create, edit, delete, and browse a user’s own reviews, and reviews by posting
#### Changes:
- Concept remained the same

### UserInfoConcept:
#### Progress
- Created standard syncs (request, success, error) for all actions
- Syncs exist to set user info when a user is created and delete the user info when a user is deleted
- Added an editable user profile dropdown in the frontend that displays the user’s information
#### Future Steps
- Add first and last names to User profile

#### Changes
- Added a _getUserEmailAddress query for the Notification concept syncs
