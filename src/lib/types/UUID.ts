/**
 * UUID type
 */
export class UUID extends String {
  constructor(value: string) {
    super(value)
    if (value.length !== 36) {
      throw new Error('UUID must be 36 characters long.')
    }

    if (!/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(value)) {
      throw new Error(`${value} is not a valid UUID!`)
    }
  }
}