# Beta Checkpoint Submission
## Public URL
Public Link: [https://damgoodhousing.onrender.com/login](https://damgoodhousing.onrender.com/login)

## Screen Recording


## Updated Development Plan

| Feature                              | Lead             | Date      | Notes                                                                                                                                                                                       |
| ------------------------------------ | ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~Concept Specs Completed~~          | ~~All, divided~~ | ~~11/18~~ |                                                                                                                                                                                             |
| ~~Sync Specs Completed~~             | ~~Christina~~    | ~~11/18~~ |                                                                                                                                                                                             |
| ~~Database Initialization~~          | ~~Camila~~       | ~~11/19~~ | ~~Startup MongoDB Database~~                                                                                                                                                                |
| ~~Concept Implementations (below)~~  | ~~All, divided~~ | ~~11/21~~ |                                                                                                                                                                                             |
| ~~UserConcept~~                      | ~~Kailey~~       | ~~11/21~~ |                                                                                                                                                                                             |
| ~~UserAuthConcept~~                  | ~~Christina~~    | ~~11/21~~ |                                                                                                                                                                                             |
| ~~RoomatePostingConcept~~            | ~~Meg~~          | ~~11/21~~ |                                                                                                                                                                                             |
| ~~NotificationConcept~~              | ~~Camila~~       | ~~11/21~~ |                                                                                                                                                                                             |
| ~~SavedItems/StatusItemsConcept~~    | ~~Christina~~    | ~~11/21~~ |                                                                                                                                                                                             |
| ~~API Spec for Backend~~             | ~~Kailey~~       | ~~11/22~~ |                                                                                                                                                                                             |
| ~~Frontend Skeleton~~                | ~~All~~          | ~~11/22~~ |                                                                                                                                                                                             |
| ~~Sync Implementation~~              | ~~All~~          | ~~11/28~~ |                                                                                                                                                                                             |
| ~~Render Static Site Hosting~~       | ~~Christina~~    | ~~12~~/1  |                                                                                                                                                                                             |
| ~~**Checkpoint Alpha**~~                 | ~~All~~              | ~~11/25~~     | ~~Have completed: Concept Specs, Sync Specs, Concept Implementations, Sync Implementations, Backend Completed, Frontend Skeleton~~                                                              |
| ~~ReviewingConcept Implementation~~      | ~~Kailey~~           | ~~11/27~~     |                                                                                                                                                                                             |
| ~~Google Maps Viewport~~                 | ~~Camila~~           | ~~11/27~~     |                                                                                                                                                                                             |
| ~~Frontend Customization~~               | ~~Camila, Meg~~      | ~~11/28~~     | ~~App-specific and visual-design specific components~~                                                                                                                                          |
| ~~Team Member Testing and Observations~~ | ~~Individual~~       | ~~11/28~~     | ~~Follow variations of user journeys and edge cases, take notes of what works and what doesn’t.~~                                                                                               |
| **Checkpoint Beta**                  | All              | 12/2      | Should have completed: A working application, reflects visual design study, maintained document of design choices/changes, correct server & notification updates, site hosted on public URL |
| Team Member Testing and Observations | Individual       | 12/3      | Follow variations of user journeys and edge cases, take notes of what works and what doesn’t.                                                                                               |
| **User Testing**                     | All              | 12/7      |                                                                                                                                                                                             |
| Team Member Testing and Observations | Individual       | 12/8      | Follow variations of user journeys and edge cases, take notes of what works and what doesn’t.                                                                                               |
| **Full Demo**                        | All              | 12/9      |                                                                                                                                                                                             |
| **Project Report**                   | All              | 12/9      | Final versions: source code, design documents, concept specs, mentoring meeting records; additionally: design summary, individual reflections                                               |
Notes: Responsibilities between Alpha and Beta varied slightly

# Key Updates/Changes From Alpha
## ListingConcept
- Added editing functionality with syncs  
- Added deletions to the front end and syncs  
- Verified through syncs that users can only edit or delete their own listings  

## RoommatePostingConcept
- Added editing functionality with syncs  
- Added deletions to the front end and syncs  
- Verified through syncs that users can only edit or delete their own posts  
- Added many attributes and corresponding actions to roommate posting, including:  
  - Start/end dates  
  - Daily rhythm  
  - Cleanliness  
  - Home environment  
  - Visitors  
  - Number of roommates  

## General UI
- Debugged “My Postings” so it functions properly now  
- Design updates: click for more details about each post/listing  
- New layout for design

## Photos
- Added photo functionality: displaying, adding, deleting, editing  
- Added delete/edit password  
- Added show/hide password ability when typing it in  

# Potential Improvements for Final Version
- Better error message handling/displaying in front end
- General UI updates (edge cases/consistency)
- More information for roommate postings (first name, social media)