import '@testing-library/jest-dom/vitest'
import {cleanup} from '@testing-library/react'
import {afterEach, vi} from 'vitest'

// Unit tests never talk to Firebase: the service layer is replaced for every test file.
vi.mock('@/services', () => ({
    approveSuggestion: vi.fn(),
    createCategory: vi.fn(),
    createSuggestion: vi.fn(),
    createTerms: vi.fn(),
    deleteCategory: vi.fn(),
    deleteTerm: vi.fn(),
    denySuggestion: vi.fn(),
    listenAuthState: vi.fn(() => () => undefined),
    listenNewSuggestions: vi.fn(() => () => undefined),
    readAmountOfCategories: vi.fn(),
    readAmountOfLogs: vi.fn(),
    readAmountOfSuggestions: vi.fn(),
    readAmountOfTerms: vi.fn(),
    readCategories: vi.fn(),
    readIsAdmin: vi.fn(),
    readLogsPaginated: vi.fn(),
    readSuggestionsPaginated: vi.fn(),
    readTermCounts: vi.fn(),
    readTermsByCategoryIds: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    startAnalytics: vi.fn(),
    stopAnalytics: vi.fn(),
    updateCategory: vi.fn(),
    updateTerm: vi.fn()
}))

// jsdom lacks a few browser APIs that Chakra UI uses.
window.matchMedia ??= (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
})

globalThis.ResizeObserver ??= class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
}

window.scrollTo = () => undefined

afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.clearAllMocks()
})
