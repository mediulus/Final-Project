# UserInfo Concept

**concept** UserInfo [User]

**purpose** to keep track of a user’s personal information

**principle** after a user sets their personal information (with updates as necessary), it can be used to understand a user's identity and how to get in touch with the user outside of the app

**state**

    a set of UserInfos with
        a User
        an emailAddress String
        a gender Enum{Female, Male, Non-Binary, PreferNotToSay}
        an age Number
        an affiliation Enum{undergraduate, graduate, professor, affiliate}

**actions**

    setInfo(user: User, emailAddress: String, gender: Gender, age: Number, affiliation: Affiliation) : (userInfo: UserInfo)
        requires a userInfo with user doesn’t exist in set of userInfos
        effects creates and returns a new userInfo with user, emailAddress, gender, age, and affiliation

    updateEmailAddress(user: User, emailAddress: String) : (userInfo: UserInfo)
        requires userInfo with user exists in set of userInfos
        effects updates emailAddress of user's userInfo to given emailAddress and returns userInfo

    updateGender(user: User, gender: Gender) : (userInfo: UserInfo)
        requires userInfo with user exists in set of userInfos
        effects updates gender of user's userInfo to given gender and returns userInfo

    updateAge(user: User, age: Number) : (userInfo: UserInfo)
        requires userInfo with user exists in set of userInfos
        effects updates age of user's userInfo to given age and returns userInfo

    updateAffiliation(user: User, affiliation: Affiliation) : (userInfo: UserInfo)
        requires userInfo with user exists in set of userInfos
        effects updates affiliation of user's userInfo to given affiliation and returns userInfo

    deleteInfo(user: User)
        requires userInfo with user exists in set of userInfos
        effects removes user's userInfo from set of userInfos
