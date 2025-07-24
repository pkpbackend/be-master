import _ from 'lodash'
import getterObject from './getterObject'
import Multers from './Multer'

/**
 * @typedef ExpressRequest
 * @type {import('express').Request & withState}
 */

class withState {
  req

  /**
   * Construct class with state
   * @param {Request} req - Express Request
   */
  constructor(req) {
    this.req = req
    this.req.setState = this.setState.bind(this)
    this.req.setBody = this.setBody.bind(this)
    this.req.setFieldState = this.setFieldState.bind(this)
    this.req.getState = this.getState.bind(this)
    this.req.getCookies = this.getCookies.bind(this)
    this.req.getHeaders = this.getHeaders.bind(this)
    this.req.getQuery = this.getQuery.bind(this)
    this.req.getQueryPolluted = this.getQueryPolluted.bind(this)
    this.req.getParams = this.getParams.bind(this)
    this.req.getBody = this.getBody.bind(this)
    this.req.getSingleArrayFile = this.getSingleArrayFile.bind(this)
    this.req.pickSingleFieldMulter = this.pickSingleFieldMulter.bind(this)
    this.req.getMultiArrayFile = this.getMultiArrayFile.bind(this)
    this.req.pickMultiFieldMulter = this.pickMultiFieldMulter.bind(this)
  }

  /**
   * Set State and injecting object into Request
   * @param {Object.<string, any>} value - value to be setted on state
   * @returns {void}
   */
  setState(value) {
    this.req.state = {
      ...(this.req.state || {}),
      ...value,
    }
  }

  /**
   * Set Body and injecting object into Request
   * @param {Object.<string, any>} value - value to be setted on state
   * @returns {void}
   */
  setBody(value) {
    this.req.body = {
      ...this.req.body,
      ...value,
    }
  }

  /**
   * Set Field state
   * @param {string|number} key Key of field state
   * @param {any} value value of it
   * @returns {void}
   */
  setFieldState(key, value) {
    _.set(this.req.state, key, value)
  }

  /**
   * Get properties of query state
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   * @returns {void}
   */
  getState(path, defaultValue) {
    return _.get(this.req.state, path, defaultValue)
  }

  /**
   * Get properties of query cookies
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getCookies(path, defaultValue) {
    return getterObject(this.req.cookies, path, defaultValue)
  }

  /**
   * Get properties of query header
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getHeaders(path, defaultValue) {
    return getterObject(this.req.headers, path, defaultValue)
  }

  /**
   * Get properties of query
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getQuery(path, defaultValue) {
    return getterObject(this.req.query, path, defaultValue)
  }

  /**
   * Get properties of query polluted
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getQueryPolluted(path, defaultValue) {
    return getterObject(this.req.queryPolluted, path, defaultValue)
  }

  /**
   * Get properties of parameter
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getParams(path, defaultValue) {
    return getterObject(this.req.params, path, defaultValue)
  }

  /**
   * Get properties of body
   * @param {string} path Key of field state
   * @param {any} defaultValue value of it
   */
  getBody(path, defaultValue) {
    return getterObject(this.req.body, path, defaultValue)
  }

  /**
   *  Get Single Array File from Express Request Files
   * @param {string} name
   * @returns {Express.Multer.File | undefined}
   */
  getSingleArrayFile(name) {
    /** @type {Express.Multer.File} */
    const data = getterObject(this.req, ['files', name, '0'].join('.'))

    if (data) {
      return data
    }
  }

  /**
   * Pick multiple files from multer uploaded.
   * @param {Array<string>} fields
   * @returns {Partial<any>}
   */
  pickSingleFieldMulter(fields) {
    return Multers.pickSingleFieldMulter(this.req, fields)
  }

  /**
   *  Get Multi Array File(s) from Express Request Files
   * @param {string} name
   * @returns {Express.Multer.File | undefined}
   */
  getMultiArrayFile(name) {
    /** @type {Express.Multer.File} */
    const data = _.get(this.req.files, name, [])

    if (data) {
      return data
    }
  }

  /**
   * Pick multiple files from multer uploaded.
   * @param {Array<string>} fields
   * @returns {Partial<any>}
   */
  pickMultiFieldMulter(fields) {
    return Multers.pickMultiFieldMulter(this.req, fields)
  }
}

export default withState
