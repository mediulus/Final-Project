# Summary of Design Changes Since Original Proposal

## Overall Highlights
Our design evolved significantly from the original proposal through iterative development, mentoring feedback, and user testing. The main focus shifted toward usability, clearer UI flows, and stronger sync and session integrations across concepts. We also made key simplifications, such as removing reviewing functionality, to better align with the app’s purpose as a short-term housing and roommate platform, particularly for summer housing.

---

## Backend and Concept Architecture

### PasswordAuthConcept
- Integrated syncs with Notification, UserInfo, and Listing for registration, login, and deletion.
- Added new queries for username lookups and ensured compatibility with front-end sessioning.
- Improved security by requiring session tokens for most API calls and syncs.

### ListingConcept
- Implemented editing and deletion functionality with proper syncs and permission checks.
- Added photo management (displaying, adding, deleting, and editing).
- Ensured deleted listings automatically cascade to remove from users’ Saved Items.

### RoommatePostingConcept
- Added editing and deletion syncs with user validation.
- Expanded posting attributes including start/end dates, cleanliness, rhythm, home environment, visitors, and roommate count.
- Synced automatic deletion of associated Saved Items when posts are removed.

### SavedItemsConcept
- Added tagging (“Favorites”) and improved synchronization with listing and roommate deletions.
- Linked interest and contact actions to notifications and enhanced the Favorites display in user profiles.

### NotificationConcept
- Integrated the Google Mail API to send real emails for registration, interest notifications, and deletions.
- Developed custom message body templates and subject overrides.
- Added automatic “Contacted” tagging when users reach out through a posting.

### SessioningConcept
- Strengthened backend security by requiring session validation for nearly all API calls.

### App Simplification
- Removed ReviewingConcept, since reviews were not relevant for one-time, short-term housing posts.

---

## Frontend and UI Enhancements

### Core UI Improvements
- Redesigned layouts for greater clarity and usability.
- Adjusted the visual style to better match the design study, creating a warmer, more welcoming aesthetic.
- Fixed “My Postings” functionality and improved layout consistency.
- Added show/hide password, edit/delete confirmations, and Google Map integration for listings.
- Enhanced error handling and user feedback for registration, login, and contact actions.

### Filtering and Search
- Implemented new filtering options:
  - Housing: price and date ranges, location
  - Roommates: gender, age, and location

### Favoriting and Feedback
- Added a favorite button on detailed view pages and standardized filled/unfilled heart icons.
- Favorites now update dynamically based on user actions.

### Google Maps
- Introduced a map view using the Google Maps API to visualize housing listings.
- Added address autocomplete and location-based filtering.

---

## User Testing–Driven Refinements
- Newest posts now appear at the top for easier visibility.
- Clarified instructions in the amenities section.
- Separated “What you’re looking for” and “Tell us about yourself” in the roommate form for better readability.
- Added “Number of roommates looking for” and a “housing tag” for clearer context.
- Auto-populated age and gender fields for convenience while allowing edits.
- Improved overall layout organization, spacing, and responsiveness.

---

## Summary of Impact
The project evolved from a minimal housing board into a well-integrated, user-friendly housing and roommate platform with polished data handling, visual clarity, and seamless user communication. The updates prioritized usability and interactivity, resulting in a cohesive, complete final product for our users.
