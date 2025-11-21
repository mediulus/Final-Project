# RoommatePosting Concept

**concept** RoommatePosting

**purpose** help MIT students find another MIT roommate to live with them over the summer

**principle** an MIT student can create a roomatePost to let others know their summer plans and preferences, which other students can then browse to find a match

    a set of RoommatePostings with
        an _id ID
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

        delete(posting: ID)
            requires: posting exists
            effects: deletes the posting from the set of roommatePostings
