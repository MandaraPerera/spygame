export const formatDate = (timestamp: Date): string => {
    const day = timestamp.getDate().toString().padStart(2, "0")
    const month = (timestamp.getMonth() + 1).toString().padStart(2, "0")
    const year = timestamp.getFullYear()

    const hour = timestamp.getHours().toString().padStart(2, "0")
    const minute = timestamp.getMinutes().toString().padStart(2, "0")

    return `${day}/${month}/${year} - ${hour}:${minute}`
}