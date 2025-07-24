import _ from 'lodash'

/**
 *
 * @param {import('express').Request} req
 * @param {Array<string>} fields
 * @returns {Partial<any>}
 */
function pickSingleFieldMulter(req, fields) {
  return _.pickBy(
    fields.reduce((acc, field) => {
      acc[field] = req.getSingleArrayFile(field)
      return acc
    }, {}),
    (value) => {
      // eslint-disable-next-line no-undefined
      return value !== undefined
    }
  )
}

/**
 *
 * @param {import('express').Request} req
 * @param {Array<string>} fields
 * @returns {Partial<any>}
 */
function pickMultiFieldMulter(req, fields) {
  return _.pickBy(
    fields.reduce((acc, field) => {
      acc[field] = req.getMultiArrayFile(field)
      return acc
    }, {}),
    (value) => {
      // eslint-disable-next-line no-undefined
      return value !== undefined
    }
  )
}

const Multers = {
  pickSingleFieldMulter,
  pickMultiFieldMulter,
}

export default Multers
