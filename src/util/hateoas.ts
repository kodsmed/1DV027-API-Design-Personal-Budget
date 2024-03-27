/**
 * HATEOAS utility functions
 */
import { Request } from 'express'
import { serverOptions } from '../config/serverOptions.js'

export function getBaseLink(req: Request): string {
  // extract the api version from the request
  const requestParts = req.originalUrl.split('/')
  let hostBaseUrl = serverOptions.baseURL || ''
  if (hostBaseUrl === '/') {
    hostBaseUrl = ''
  }

  // the api version comes after /api
  const apiIndex = requestParts.indexOf('api')
  let versionString = ''
  if (apiIndex === -1) {
    versionString = '/v1'
  } else {
  // the version string is the next element
  versionString = '/' + requestParts[apiIndex + 1]
  }


  const baseUrlPath = req.protocol + '://' + req.get('host') + hostBaseUrl + '/api' + versionString
  return baseUrlPath
}