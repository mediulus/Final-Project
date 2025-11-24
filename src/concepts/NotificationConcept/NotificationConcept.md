# Notification Concept

**concept** Notification

**purpose** to handle notifying users upon significant updates to information

**principle** email server sends an email containing intended message to recipient

**state**

    a set of Items with
        an emailAddress string
        a postName string

    a set of Messages with
        a MessageTemplate string
        a recipientEmail string
        a recipientName string

**actions**

    createMessageBody(template: MessageTemplate, email: recipientEmail, name: recipientName) : Message
        requires: template, email, name are valid; email is an MIT / approved organizational email
        effects: creates messageBody with given template, email, and name

    sendEmail(message: Message)
        requires: message is a valid Message
        effects: (temporary) instead of sending via an email server, the message is printed to the application's console/log output for testing and development. In a later stage this will call the Gmail API to deliver the message to the recipient.
