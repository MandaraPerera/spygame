export {
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
    listenSuggestions
} from './suggestions'

export type {PaginatedSuggestions} from './suggestions'

export {
    getAllTermsByCategoryId,
    getAmountOfTerms
} from './terms'