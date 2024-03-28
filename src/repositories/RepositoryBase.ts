/**
 * @file RepositoryBase is a base class for all repositories. It provides basic CRUD operations.
 * @module repositories/RepositoryBase
 */

import mongoose, { mongo } from "mongoose"
import { ExtendedError } from "../lib/types/ExtendedError.js"
import { IUserModel } from "../models/schemas/UserSchema.js"

// declare an options object to be used in the getByQuery method
export interface Options {
  limit: number,
  skip: number
}

export interface Pagination {
  page: number,
  perPage: number,
}

export interface Result {
  data: mongoose.Document[],
  pagination: {
    totalCount: number,
    page: number,
    perPage: number,
    totalPages: number
  }
}

export class RepositoryBase {
  /**
   * The model to be used by the repository.
   */
  protected model: mongoose.Model<mongoose.Document>

  /**
   * Creates an instance of the RepositoryBase class.
   *
   * @param {mongoose.Model<mongoose.Document>} model - The model to be used by the repository.
   */
  constructor(model: mongoose.Model<mongoose.Document>) {
    this.model = model
  }

  /**
   * Creates a new document.
   *
   * @param {object} data - The data to be used to create the document.
   * @returns {Promise<mongoose.Document>} - The created document.
   */
  async create(data: object): Promise<mongoose.Document> {
    try {
      const model = this.model as mongoose.Model<mongoose.Document>
      return await model.create(data)
    } catch (error: any) {
      console.log(error)
      let errorToPass = new Error("Unknown error.")
      let code = 500
      if (error instanceof mongoose.Error) {
        errorToPass = new Error("Failed to create document.")
        code = 400
      }
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      if (error instanceof mongo.MongoServerError) {
        errorToPass = new Error("Failed to create document.")
        code = 400
        if (error.code  && error.code === 11000) {
          errorToPass = new Error("Duplicate key.")
          code = 409
        }
      }

      const err = new ExtendedError(errorToPass.message, code, errorToPass, "RepositoryBase.create")
      throw err
    }
  }

  /**
   * Retrieves all documents.
   *
   * @param {Pagination} pagination - The pagination object.
   * @returns {Result} - Documents and pagination information.
   */
  async getAll(pagination: Pagination = { page: 1, perPage: 20 }): Promise<Result> {
    try {

      const page = Math.max(pagination.page, 1) // page should be at least 1
      const perPage = Math.min(Math.max(pagination.perPage, 1), 100) // perPage should be between 1 and 100

      const model = this.model as mongoose.Model<mongoose.Document>
      const docs = await model
        .find()
        .limit(perPage)
        .skip((page - 1) * perPage)
        .exec()

      const totalDocs = await this.model.countDocuments()
      const totalPages = Math.ceil(totalDocs / perPage)

      return {
        data: docs,
        pagination: {
          totalCount: totalDocs,
          page: page,
          perPage: perPage,
          totalPages: totalPages
        }
      }


    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
      }
      else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      } else {
        errorToPass = new Error("Failed to get document.")
      }
      const err = new ExtendedError("Failed to get document.", code, errorToPass, "RepositoryBase.getAll")
      throw err
    }
  }

  /**
   * Retrieves a document by its ID.
   *
   * @param {string} id - The ID of the document to be retrieved.
   * @returns {Promise<mongoose.Document>} - The document.
   */
  async getById(id: string, projection = null, options = null): Promise<mongoose.Document> {
    try {
      const model = this.model as mongoose.Model<mongoose.Document>
      const doc = await model.findOne({'_id': id}, projection, options).exec()

      if (!doc) {
        throw new mongoose.Error.DocumentNotFoundError("Document not found.")
      }

      return doc
    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
      }
      else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      } else {
        errorToPass = new Error("Failed to get document.")
      }
      const err = new ExtendedError("Failed to get document.", code, errorToPass, "RepositoryBase.getById")
      throw err
    }
  }

  /**
   * Retrieves documents by a query.
   *
   * @param {object} query - The query to be used to retrieve the documents.
   * @param {object|string|string[]} projection - The projection to be used to retrieve the documents.
   * @param {Options| null} options - The options to be used to retrieve the documents. See https://mongoosejs.com/docs/api.html#query_Query-setOptions for more information.
   */
  async getByQuery(query: object, projection: object | string | string[] | null = null, options: Options | null = null): Promise<Result> {
    try {
      const model = this.model as mongoose.Model<mongoose.Document>
      const docs = await model
        .find(query, projection, options)
        .exec()

    if (typeof options !== "object" || options === null) {
      options = {
        limit: 20,
        skip: 0
      }
    } else {
      if (!options.limit) {
        options.limit = 20
      }
      if (!options.skip) {
        options.skip = 0
      }
    }
    const perPage = options?.limit || 20
    const totalDocs = await this.model.countDocuments()
    const totalPages = Math.ceil(totalDocs / perPage)

    return {
      data: docs,
      pagination: {
        totalCount: totalDocs,
        page: (options?.skip || 0) / perPage + 1,
        perPage: perPage,
        totalPages: totalPages
      }
    }
    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
      }
      else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      } else {
        errorToPass = new Error("Failed to get document.")
      }
      const err = new ExtendedError("Failed to get document.", code, errorToPass, "RepositoryBase.getByQuery")
      throw err
    }
  }

  /**
   * Retrieves a document by a query.
   */
  async getOneByQuery(query: object, projection: object | string | string[] | null = null, options: Options | null = null): Promise<mongoose.Document> {
    try {
      const model = this.model as mongoose.Model<mongoose.Document>
      const doc = await model
        .findOne(query, projection, options)
        .exec()

      if (!doc) {
        throw new mongoose.Error.DocumentNotFoundError("Document not found.")
      }

      return doc
    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
      }
      else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      } else {
        errorToPass = new Error("Failed to get document.")
      }
      const err = new ExtendedError("Failed to get document.", code, errorToPass, "RepositoryBase.getOneByQuery")
      throw err
    }
  }

  /**
   * Deletes a document by its ID.
   */
  async deleteById(id: string): Promise<void> {
    try {
      const model = this.model as mongoose.Model<mongoose.Document>
      const doc = await model.deleteOne({id: id}).exec()
      console.log("doc:", doc)

    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
      } else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      } else {
        errorToPass = new Error("Failed to delete document.")
      }
      const err = new ExtendedError("Failed to delete document.", code, errorToPass, "RepositoryBase.deleteById")
      throw err
    }
  }

  /**
   * Delete document by document.
   *
   * @param {mongoose.Document} doc - The document to be deleted.
   * @returns {Promise<void>} - The deleted document.
   */
  async deleteByDocument(doc: mongoose.Document): Promise<void> {
    try {
      // Create the delete data.
      const deleteData = { _id: doc._id }

      // Delete the document.
      const model = this.model as mongoose.Model<mongoose.Document>
      await model.deleteOne(deleteData).exec()
      return
    } catch (error) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        // The document was not found, it was probably already deleted.
        code = 404
      }
      else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        code = 404
      }
      else {
        errorToPass = new Error("Failed to delete document.")
      }
      throw new ExtendedError('Failed to delete document.', code, errorToPass, 'RepositoryBase.deleteByDocument')
    }
  }

  /**
   * Saves a document.
   *
   * @param {mongoose.Document} doc - The document to be saved.
   * @returns {Promise<mongoose.Document>} - The saved document.
   */
  async save(doc: mongoose.Document): Promise<mongoose.Document> {
    try {
      return await doc.save()
    } catch (error) {
      let errorToPass = new Error("Failed to save document.")
      let code = 500
      let message = "Failed to save document."
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        errorToPass = new Error("Document not found.")
        message = "Document not found."
        code = 404
      } else if (error instanceof mongoose.Error.CastError) {
        errorToPass = new Error("Invalid ID.")
        message = "Invalid ID."
        code = 404
      } else if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        message = "Validation failed."
        code = 400
      }
      const err = new ExtendedError(message, code, errorToPass, "RepositoryBase.save")
      throw err
    }
  }
}