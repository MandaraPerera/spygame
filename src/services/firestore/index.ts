export {
    createCategory,
    getCategoryIdByName,
    getAllCategories,
    getAmountOfCategories
} from './categories'

export {
    createLog,
    getAmountOfLogs
} from './logs'

export {
    createSuggestion,
    getAmountOfSuggestions,
    getAllSuggestionsPaginated,
    listenSuggestions,
    deleteSuggestion
} from './suggestions'

export type {PaginatedSuggestions} from './suggestions'

export {
    createTerm,
    getAllTermsByCategoryId,
    getAmountOfTerms
} from './terms'