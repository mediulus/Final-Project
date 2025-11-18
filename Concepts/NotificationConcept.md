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

    createMessageBody(template: MessageTemplate, email: recipientEmail, name: recipientName: ) : Message
        requires: template, email, name are valid, email is an MIT / approved organizational email
        effects: creates messageBody

    sendEmail(message: Message)
        requires: message is a valid Message
        effects: sends message to message’s recipient
