// Cannot use normal import path because of https://github.com/cypress-io/cypress/issues/23826
import { propertiesToJson } from 'properties-file/lib/content/index'

/**
 * Get the messages of a `.properties` file.
 *
 * @param content - The content of a `.properties` file.
 */
export function getMessages(content: string): { [key: string]: string } {
  return Object.fromEntries(
    Object.entries(propertiesToJson(content)).map(([key, value]) => [key.split('.').pop(), value])
  )
}
