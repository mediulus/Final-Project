# RoommatePosting Concept

**concept** RoommatePosting

**purpose** help MIT students find another MIT roommate to live with them over the summer

**principle** an MIT student can create a roomatePost to let others know their summer plans and preferences, which other students can then browse to find a match

    a set of RoommatePostings with
        a poster User
        a city String
        a gender Enum{Female, Male, Non-Binary, PreferNotToSay}
        an age Number
        a description String

**actions**

        create(poster: User, city: String, gender: Gender, age: Number, description: String) : RoommatePosting
            requires: a roommatePosting with this poster does not already exist in set of roommatePostings
            effects: creates and returns new posting with the given poster, city, gender, age, and description

        editCity(poster: User, city: String) : RoommatePosting
            requires: a roomatePosting with this poster exists in set of roommatePostings
            effects: updates the posting's city to the given city and returns the posting

        editGender(poster: User, gender: Gender) : RoommatePosting
            requires: a roomatePosting with this poster exists in set of roommatePostings
            effects: updates the posting's gender to the given gender and returns the posting

        editAge(poster: User, age: Number) : RoommatePosting
            requires: a roomatePosting with this poster exists in set of roommatePostings
            effects: updates the posting's age to the given age and returns the posting

        editDescription(poster: User, age: Number) : RoommatePosting
            requires: a roomatePosting with this poster exists in set of roommatePostings
            effects: updates the posting's description to the given description and returns the posting

        delete(posting: RoommatePosting)
            requires: posting exists
            effects: deletes the posting from the set of roommatePostings
        
        getPostingByPosterId(poster:User): roommatePosting
            requires: poster has a posting
            effects: returns the posters post

        getPostingsByCity(city: string): roomatePosting[]
            requires: there are postings with that city
            effects: returns the postings with that city or an error if no posts have that city

        getPostingByAge(age: Number): roommatePosting[]
            requires: there are postings with that age
            effects: returns the postings with the age and error if no posts have that age

        getAllPostings(): roommatePosting[]
            requires: there are postings
            effects: returns all of the roomatePostings
        
        deletePostingsByPoster(Poster: ID)
            requires: at least one posting exists for the given poster
            effects: deletes all roommate postings for the given poster and returns the IDs of deleted postings


**Syncs**

    sync CreateRoommatePostingRequest
      when
          Requesting.request (path: "/RoommatePosting/create", session, city, gender, age, description) : (request)
      where
          in Sessioning: user is associated with session
      then
          RoommatePosting.create (poster: user, city, gender, age, description)


    sync CreateRoommatePostingResponseSuccess
      when
          Requesting.request (path: "/RoommatePosting/create") : (request)
          RoommatePosting.create () : (posting)
      then
          Requesting.respond (request, posting)


    sync CreateRoommatePostingResponseError
      when
          Requesting.request (path: "/RoommatePosting/create") : (request)
          RoommatePosting.create () : (error)
      then
          Requesting.respond (request, error)


    sync DeleteRoommatePostingRequest
      when
          Requesting.request (path: "/RoommatePosting/delete", session, postingId) : (request)
      where
          in Sessioning: user is associated with session
      then
          RoommatePosting.delete (postingId)

    sync DeleteRoommatePostingResponse
      when
          Requesting.request (path: "/RoommatePosting/delete", postingId) : (request)
          RoommatePosting.delete (postingId) : ()
      then
          Requesting.respond (request, status: "deleted", postingId)


    sync RemoveRoommatePostingFromSavedItems
      when
          RoommatePosting.delete (postingId) : ()
      where
          in SavedItems: user has saved item matching postingId
      then
          SavedItems.removeItem (user, item: postingId)


These are all the the changes made for now, however depending on progress it may be feasible to add pictures to the roomate profile per the suggestions in out feature design assignment. 

