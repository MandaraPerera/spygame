// Keep NAME_*_LENGTH and MAX_TERMS_PER_SUGGESTION in sync with firestore.rules.
export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 10
export const MIN_SPIES = 1

export const NAME_MIN_LENGTH = 4
export const NAME_MAX_LENGTH = 20
export const MAX_TERMS_PER_SUGGESTION = 50
export const MIN_TERMS_FOR_NEW_CATEGORY = 5

// Admins add at most this many terms at once: one batch, and one log entry with a bounded list.
export const MAX_TERMS_PER_ADD = 50

export const SUGGESTIONS_PAGE_SIZE = 10
export const LOGS_PAGE_SIZE = 20
