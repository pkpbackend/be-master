import _ from 'lodash'

/**
 *
 * @param {Object.<string, any>} object
 * @param {keyof object} path
 * @param {any} defaultValue
 * @returns {Object.<string, any> | null | undefined}
 */
function getterObject(object, path, defaultValue) {
  if (_.isNil(path) || path === '') {
    return object
  }

  return _.get(object, path, defaultValue)
}

export default getterObject
