// Firestore collection names, in one place so the services do not import each other for them.
export const CATEGORIES_COLLECTION = "categories"
export const TERMS_COLLECTION = "terms"
export const SUGGESTIONS_COLLECTION = "suggestions"
export const LOGS_COLLECTION = "logs"

// Stay well below Firestore's limit of 500 writes per batch.
export const BATCH_SIZE = 450
