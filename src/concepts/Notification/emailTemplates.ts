/**
 * Global email templates used by NotificationConcept.
 * These are simple text placeholders that can later be replaced with dynamic or HTML versions.
 */

export const ACCOUNT_WELCOME_TEMPLATE = `
Hi {{name}},

🎉 Welcome to Dam Good Housing!

Your account ({{name}}) has been successfully created.
You can now log in and start exploring listings or roommate postings right away.

— The DGH Team
`;

export const ACCOUNT_DELETION_TEMPLATE = `
Hi {{name}},

Your Dam Good Housing account ({{name}}) has been deleted.
We’re sorry to see you go — your data and saved items have been securely removed from our system.

If you change your mind, you’re always welcome to create a new account.

— The DGH Team
`;

export const PASSWORD_CHANGE_TEMPLATE = `
Hi {{name}},

This is to let you know that your password for Dam Good Housing was recently changed.
If this wasn’t you, please contact support immediately.

— The DGH Team
`;

export const HOUSING_POST_CREATED_TEMPLATE = `
Hi {{name}},

Your new housing listing is live on Dam Good Housing! 🏠
Interested roommates or tenants can now reach out directly.

You can edit or remove your listing anytime from your dashboard.

— The DGH Team
`;

export const ROOMMATE_POST_CREATED_TEMPLATE = `
Hi {{name}},

Your roommate posting is live! 👫
Other users can now view your profile and reach out if they’re a good match.

— The DGH Team
`;

export const HOUSING_CONTACT_NOTIFICATION_TEMPLATE = `
Hi {{name}},

Someone is interested in your housing listing! 📨

Check your Dam Good Housing inbox or email for their message to follow up.

— The DGH Team
`;

export const ROOMMATE_CONTACT_NOTIFICATION_TEMPLATE = `
Hi {{name}},

Someone wants to connect about your roommate posting! 👋

You can view their message in your inbox and decide whether to connect.

— The DGH Team
`;

export const SAVED_POST_UPDATE_TEMPLATE = `
Hi {{name}},

An update was made to a post you saved on Dam Good Housing.

It might be a new price, availability change, or updated description — check your Saved Posts for details.

— The DGH Team
`;
