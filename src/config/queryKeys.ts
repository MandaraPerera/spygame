export const categoryKeys = {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const
}

export const suggestionKeys = {
    all: ['suggestions'] as const,
    paginated: ['suggestions', 'paginated'] as const,
    detail: (id: string) => ['suggestions', id] as const
}

export const termKeys = {
    all: ['terms'] as const,
    categories: (categoryIds: string[]) => ['terms', categoryIds] as const,
    detail: (id: string) => ['terms', id] as const
}
