declare const Brand: unique symbol;

/**
 * Generic ID: effectively a string,
 * but uses type branding.
 */
export type ID = string & { [Brand]: true };

/**
 * Empty record type: enforces no entries.
 */
export type Empty = Record<PropertyKey, never>;
