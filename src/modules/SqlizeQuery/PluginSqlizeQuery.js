import dbConfig from '../../config/database'
import SqlizeQuery, {
  getPrimitiveDataType,
  transfromIncludeToQueryable,
} from './SqlizeQuery'
import _ from 'lodash'
import { Op } from 'sequelize'
import str from '../../helpers/string'

/**
 *
 * @param value
 * @returns
 */
const parserString = (value) => {
  return typeof value === 'string' ? JSON.parse(value) : value || []
}

/**
 *
 * @param id
 * @param prefixName
 * @returns
 */
function getExactQueryIdModel(id, prefixName) {
  if (id === undefined) {
    return undefined
  }
  const splitId = id.split('.')
  if (!prefixName && splitId.length > 1) {
    return undefined
  }
  const indexId = splitId.findIndex((str) => str === prefixName)
  if (prefixName && indexId < 0) {
    return undefined
  }

  const curId = prefixName
    ? splitId
        .filter((str, index) => {
          return [indexId, indexId + 1].includes(index)
        })
        .pop()
    : id

  if (!curId || (prefixName && splitId.indexOf(curId) !== splitId.length - 1)) {
    return undefined
  }

  return curId
}

/**
 *
 * @param model
 * @param prefixName
 * @returns
 */
function getFilteredQuery(model = null, prefixName = null) {
  const sequelizeQuery = new SqlizeQuery()
  sequelizeQuery.addValueParser(parserString)
  sequelizeQuery.addQueryBuilder((filterData, queryHelper) => {
    const { id: key, value, operator: op } = filterData || {}

    let operator = op
    let id = key
    if (id?.includes('$')) {
      const splitId = id.split('$')
      operator = splitId[0]
      id = splitId[1]
    }

    const curId = getExactQueryIdModel(id, prefixName)
    if (!curId) {
      return
    }

    const type = typeof getPrimitiveDataType(
      model?.rawAttributes?.[curId]?.type
    )

    const valueType = typeof value

    // check not number
    if (type !== 'number' || valueType !== 'number') {
      if (typeof value === 'boolean' || value == undefined) {
        queryHelper.setQuery(curId, {
          [Op.eq]: value,
        })
      } else if (str.uuidValidate(value)) {
        queryHelper.setQuery(curId, {
          [Op.eq]: value,
        })
      } else if (dbConfig.dialect === 'postgres') {
        // check connection postgress case sensitive
        queryHelper.setQuery(curId, {
          [Op.iLike]: `%${value}%`,
        })
      } else if (operator?.length) {
        // find Op where is equal to operator
        const OpWhere = Object.entries(Op).find(
          ([key, value]) => value === operator || key === operator
        )

        if (OpWhere) {
          queryHelper.setQuery(curId, {
            [OpWhere[1]]: value,
          })
        } else {
          queryHelper.setQuery(curId, {
            [operator]: value,
          })
        }
      } else {
        // default not postgres
        queryHelper.setQuery(curId, {
          [Op.like]: `%${value}%`,
        })
      }
    } else {
      // default number
      queryHelper.setQuery(
        curId,
        curId.endsWith('Id')
          ? value
          : {
              [Op.like]: `%${value}%`,
            }
      )
    }
  })
  return sequelizeQuery
}

/**
 * Get Sorted Query
 * @returns
 */
function getSortedQuery() {
  const sequelizeQuery = new SqlizeQuery()
  sequelizeQuery.addValueParser(parserString)
  sequelizeQuery.addQueryBuilder((value, queryHelper) => {
    if (value?.id) {
      queryHelper.setQuery(value.id, value.desc === true ? 'DESC' : 'ASC')
    }
  })
  sequelizeQuery.addTransformBuild((buildValue, transformHelper) => {
    transformHelper.setValue(
      Object.entries(buildValue).map(([id, value]) => {
        return [...id.split('.'), value]
      })
    )
  })
  return sequelizeQuery
}

/**
 * Get Pagination Query
 * @returns
 */
function getPaginationQuery() {
  const sequelizeQuery = new SqlizeQuery()
  const offsetId = 'page'
  const limitId = 'pageSize'
  const defaultOffset = 0
  const defaultLimit = 10
  sequelizeQuery.addValueParser((value) => {
    return [
      {
        id: offsetId,
        value: parseInt(value.page),
      },
      {
        id: limitId,
        value: parseInt(value.pageSize),
      },
    ]
  })

  sequelizeQuery.addQueryBuilder(({ id, value }, queryHelper) => {
    if (id === offsetId) {
      const offsetValue = queryHelper.getDataValueById(limitId) * (value - 1)
      queryHelper.setQuery(
        'offset',
        offsetValue > 0 ? offsetValue : defaultOffset
      )
    }
    if (id === limitId) {
      queryHelper.setQuery('limit', value || defaultLimit)
    }
  })

  return sequelizeQuery
}

function getIncludeFilteredQuery(filteredValue, model, prefixName, options) {
  const where = getFilteredQuery(model, prefixName).build(filteredValue)

  let extraProps = {}

  if (Object.keys(where).length > 0) {
    extraProps = {
      ...extraProps,
      where,
      required: true,
    }
  }

  return {
    model,
    ...extraProps,
    ...options,
  }
}

/**
 *
 * @param props
 * @returns
 */
function filterIncludeHandledOnly(props) {
  const { include, filteredInclude } = props

  const curFilteredInclude = filteredInclude || []
  if (include) {
    for (let i = 0; i < include.length; i += 1) {
      const curModel = include[i]
      let childIncludes = []
      if (curModel.include) {
        childIncludes = filterIncludeHandledOnly({
          include: curModel.include,
        })
      }

      if (curModel.where || curModel.required || childIncludes.length > 0) {
        const clonedInclude = _.cloneDeep(curModel)
        _.unset(clonedInclude, 'include')
        if (childIncludes.length > 0) {
          clonedInclude.include = [...childIncludes]
        }
        curFilteredInclude.push(clonedInclude)
      }
    }
  }
  return curFilteredInclude
}

/**
 *
 * @param include
 * @returns
 */
function injectRequireInclude(include) {
  function test(dataInclude) {
    for (let i = 0; i < (dataInclude?.length || 0); i += 1) {
      const optionInclude = dataInclude[i]
      let data
      if (optionInclude.include) {
        data = test(optionInclude.include)
      }

      if (optionInclude.required) return true
      if (data && optionInclude.required === undefined) {
        optionInclude.required = true
        return true
      }
    }
    return false
  }

  test(include)

  return include
}

/**
 *
 * @param filteredValue
 * @param includes
 * @returns
 */
function makeIncludeQueryable(filteredValue, includes) {
  return transfromIncludeToQueryable(includes, (value) => {
    const { model, key, ...restValue } = value
    return getIncludeFilteredQuery(filteredValue, model, value.key, {
      key,
      ...restValue,
    })
  })
}

/**
 *
 * @param reqQuery
 * @param model
 * @param includeRule
 * @param options
 * @returns
 */
function generate(reqQuery, model, includeRule = [], options = {}) {
  const { onBeforeBuild } = options ?? {}

  const paginationQuery = getPaginationQuery()
  const filteredQuery = getFilteredQuery(model)
  const sortedQuery = getSortedQuery()
  const includeCountRule = filterIncludeHandledOnly({
    include: includeRule,
  })
  const include = injectRequireInclude(_.cloneDeep(includeRule))
  const includeCount = injectRequireInclude(_.cloneDeep(includeCountRule))

  if (onBeforeBuild) {
    onBeforeBuild({
      filteredQuery,
      paginationQuery,
      sortedQuery,
    })
  }

  let pagination
  if (
    [
      'false',
      '0',
      'no',
      'off',
      'disable',
      'disabled',
      'none',
      false,
      0,
    ].includes(reqQuery?.withLimit)
  ) {
    pagination = {
      offset: 0,
      limit: null,
    }
  } else {
    pagination = paginationQuery.build(reqQuery)
  }
  const filter = filteredQuery.build(reqQuery.filtered)
  const sort = sortedQuery.build(reqQuery.sorted)
  const attributes = JSON.parse(reqQuery?.attributes || '[]')

  return {
    include,
    includeCount,
    where: filter,
    order: sort,
    offset: pagination.offset,
    limit: pagination.limit,
    attributes: attributes.length > 0 ? attributes : undefined,
  }
}

const PluginSqlizeQuery = {
  generate,
  makeIncludeQueryable,
}

export default PluginSqlizeQuery
