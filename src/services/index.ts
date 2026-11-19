export {auth, db} from './firebase'

export {
    createCategory,
    readCategoryIdByName,
    readCategories,
    readAmountOfCategories
} from './category'

export {
    createLog,
    readAmountOfLogs
} from './log'

export {
    createSuggestion,
    readAmountOfSuggestions,
    readSuggestionsPaginated,
    listenSuggestions,
    deleteSuggestion
} from './suggestion'

export {
    createTerm,
    readTermsByCategoryIds,
    readAmountOfTerms
} from './term'
