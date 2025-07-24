/* eslint-disable @typescript-eslint/no-dynamic-delete */
class QueryHelper {
  valueQuery = {}

  data = []

  constructor(data) {
    this.data = data
  }

  getDataValueById(id) {
    return this.data.find((x) => x.id === id)?.value
  }

  setQuery(id, value) {
    // set(this.valueQuery, id, value)
    this.valueQuery[id] = value
  }

  getQuery() {
    return this.valueQuery
  }

  getQueryById(id) {
    return this.valueQuery[id]
  }

  deleteQuery(id) {
    return delete this.valueQuery[id]
  }
}

export default QueryHelper
