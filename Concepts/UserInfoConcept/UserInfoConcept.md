# UserInfo Concept

**concept** UserInfo [User]

**purpose** to keep track of a user’s personal information

**principle** after a user sets their personal contact information (with updates as necessary), it can be used to get in touch with the user outside of the app

**state**

    a set of Users with
        an emailAddress string
        a phoneNumber string
	
**actions**

    setEmailAddress(user: User, emailAddress: string) : (user: User)
        requires user doesn’t exist in set of users
        effects associates user with email address in set of users and returns user

    updateEmailAddress(user: User, emailAddress: string): (user: User)
        requires user exists in set of users
        effects updates email address associated with user and returns user

    setPhoneNumber(user: User, phoneNumber: string) : (user: User)
        requires user doesn’t exist in set of users
        effects associates user with phone number in set of users and returns user

    updatePhoneNumber(user: User, phoneNumber: string) : (user: User)
        requires user exists in set of users
        effects updates phone address associated with user and returns user
