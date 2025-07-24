import { LOG_SERVER } from '../config/baseURL'
import _ from 'lodash'
import chalk from 'chalk'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const invalidValues = [
  null,
  undefined,
  '',
  false,
  0,
  'false',
  '0',
  'null',
  'undefined',
]

/**
 *
 * @param arrayData
 * @returns
 */
function arrayFormatter(arrayData) {
  // check if data not empty
  if (!_.isEmpty(arrayData)) {
    // check if data is array, format: ['1', '2']
    if (Array.isArray(arrayData)) {
      return arrayData
    }

    // format: "['1', '2']"
    const parseJsonArray = JSON.parse(arrayData)
    if (Array.isArray(parseJsonArray)) {
      return parseJsonArray
    }

    return []
  }

  return []
}

/**
 *
 * @param value
 * @returns
 */
function validateEmpty(value) {
  const emptyValues = [null, undefined, '', 'null', 'undefined']

  if (emptyValues.includes(value)) {
    return null
  }

  return value
}

function validateBoolean(value) {
  if (invalidValues.includes(value)) {
    return false
  }

  return true
}

/**
 *
 * @param length
 * @returns
 */
function getUniqueCodev2(length = 32) {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 *
 * @param type
 * @param message
 * @returns
 */
function logServer(type, message) {
  const logErr = `${LOG_SERVER} ${chalk.blue(type)} ${chalk.green(message)}`
  return logErr
}

/**
 *
 * @param type
 * @param message
 * @returns
 */
function logErrServer(type, message) {
  const logErr = `${LOG_SERVER} ${chalk.red(type)} ${chalk.green(message)}`
  return logErr
}

const TZ_ID = { locale: id } // Timezone Indonesia

/**
 *
 * @param date
 * @returns {string}
 */
 const formatDate = (date) => {
  return format(new Date(date), 'dd-MM-yyyy', TZ_ID)
}

export {
  arrayFormatter,
  validateEmpty,
  validateBoolean,
  getUniqueCodev2,
  logServer,
  logErrServer,
  formatDate,
}