export function chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size))
    }
    return chunks
}

export function pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural
}
