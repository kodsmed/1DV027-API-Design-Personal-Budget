/**
 * Converts a Date object to a string.
 * @param {Date} date - The date to convert.
 * @returns {string} The date as a string.
 *
 * @example
 * dateToString(new Date())
 * // returns '2024-02-27 12:00'
 */

export function dateToString (date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}