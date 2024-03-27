/**
 * Define the User Data Model, a DTO to hold the user's data from the Gitlab API.
 */
export class UserData {
  username: string
  password: string
  email: string
  uuid: string
  id: string

  /**
   * Creates an instance of the UserData class.
   *
   * @param {string} username - The user's username.
   * @param {string} email - The user's email.
   * @param {string} uuid - The user's UUID.
   * @param {string} password - The user's password.
   * @param {string} id - The user's ID in the database.
   */
  constructor(
    username: string,
    email: string,
    uuid: string,
    password: string,
    id: string,
  ) {
    this.username = username
    this.email = email
    this.uuid = uuid
    this.password = password
    this.id = id
  }
}