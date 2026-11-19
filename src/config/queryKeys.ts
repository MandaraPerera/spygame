export const categoryKeys = {
    all: ['categories'] as const
}

export const suggestionKeys = {
    all: ['suggestions'] as const,
    paginated: ['suggestions', 'paginated'] as const
}

export const termKeys = {
    all: ['terms'] as const,
    byCategories: (categoryIds: string[]) => ['terms', 'categories', [...categoryIds].sort()] as const
}

export const statsKeys = {
    all: ['stats'] as const
}

export const logKeys = {
    all: ['logs'] as const
}
