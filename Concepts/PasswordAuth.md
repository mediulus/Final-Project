# PasswordAuth Concept

**concept** PasswordAuth

**purpose** enables users to securely identify themselves and manage their access through username and password credentials

**principle** if a user registers with a unique username and a password, then they can later provide those same credentials to be authenticated as that user

**state**

    a set of Users with
      a username String
      a password Hash


**actions**

    register(username: String, password: String): (user: User)
      requires: no User currently exists with the given `username`
      effects: a new User is created and returned, associated with the provided `username` and `password` hash corresponding with the inputted password

    authenticate(username: String, password: String): (user: User)
      requires: a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`
      effect: returns user associated with username

    deleteAccount(username: String, password: String)
      requires: a User exists whose `username` matches the input `username` and whose `password` hash corresponds to the input `password`
      effects: the User associated with the given `username` is deleted

    changePassword(username: String, currentPass: String, newPass: String)
      requires: a User exists whose `username` matches the input `username` and whose `password` hash corresponds to `currentPass`
      effects: the `password` of the User associated with the given `username` is updated to be corresponding to `newPass`
