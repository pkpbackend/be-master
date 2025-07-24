/**
 *
 * @param {Array} array
 * @returns boolean
 */
function isArrayObject(arr) {
  if (Array.isArray(arr) && arr.length > 0) {
    return arr
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return Object.keys(item).length > 0;
        }

        return false;
      })
      .every((item) => item === true);
  }

  return false;
}

/**
 * Ubah sorted query yang dikirim dari Front-End agar dapat dijalankan oleh
 * `sequelize` `order` query
 * @param {Array} arrQuery
 */
function extractSortedQueries(arrQuery) {
  if (isArrayObject(arrQuery)) {
    return arrQuery.map((query) => {
      return [query.id, query.desc ? 'DESC' : 'ASC'];
    });
  }

  return [];
}

module.exports = {
  isArrayObject,
  extractSortedQueries,
};
