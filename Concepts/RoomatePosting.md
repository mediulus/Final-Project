# RoomatePosting Concept

**concept** RoomatePosting

**purpose** help MIT students find another MIT roomate to live with them over the summer

**principle** an MIT student can create a roomatePost to let others know their summer plans an preferences

    a set of RoomatePostings with
        an _id: ID
        a poster: ID
        a city: String
        a gender: Enum{Female, Male, Non-Binary, PreferNotToSay} //calling this enum Gender
        an age: Number
        a description: String

**actions**

        create(poster: ID, city: String, gender: Gender, age: Number, description: String): RoomatePosting
            requires: a poster with this id does not already have a posting // can tlk about this
            effects: creates a new posting with the above attributes
        
        delete(posting: ID)
            requires: posting exists
            effects: deletes the posting

        //coudl have some "edit things--do we want to give users the ability to edit posts?"


