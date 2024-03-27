/**
 * A response object that is returned by the API... made into a type for easier use and consistency.
 * @typedef CustomResponse
 * @property {number} statusCode - The status code of the response.
 * @property {string} status - The status of the response.
 * @property {string} message - The message of the response.
 * @property {Object} data - The data of the response.
 * @property {Object} pagination - The pagination of the response.
 * @property {Hateoas} Links - The Hateoas part. */
import { Hateoas, HateoasLink } from "../../models/Hateoas.js";

export class CustomResponse {
  statusCode: number = 0
  status: string = ''
  message: string = ''
  data: Object = {}
  Links: HateoasLink[] = []
  pagination: Object = {}

  constructor(statusCode: number, status: string, message: string, data: Object, hateoas: Hateoas, pagination: {page: number, perPage:number, total: number, totalPages: number} | {}) {
    this.statusCode = statusCode
    this.status = status
    this.message = message
    this.data = data
    this.Links = hateoas.getLinks() as HateoasLink[]
    this.pagination = pagination
  }
}
