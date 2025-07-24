import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { MasterTematikPemanfaatan } = models

class MasterTematikPemanfaatanService {
  
  static async findAll(req) {
    let options = {
      withTotal: true,
      includes: [],
      where: {},
      query: req.query,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(
        options.query,
        MasterTematikPemanfaatan,
        options?.includes || []
      )

    queryFind.where = {
      ...queryFind.where,
      ...options?.where,
    }

    const data = await MasterTematikPemanfaatan.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
    })

    return data
  }

  static async findAllPaginate(req) {
    let options = {
      withTotal: true,
      includes: [],
      where: {},
      query: req.query,
    }

    let { pageSize, page } = req.query
    pageSize = isNaN(pageSize) ? 10 : parseInt(pageSize)
    page = isNaN(page) ? 1 : parseInt(page)

    options.query = {
      ...options.query,
      pageSize,
      page,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(
        options.query,
        MasterTematikPemanfaatan,
        options?.includes || []
      )

    queryFind.where = {
      ...queryFind.where,
      ...options?.where,
    }

    const data = await MasterTematikPemanfaatan.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })

    let response = {
      message: 'success',
      data,
    }

    if (options?.withTotal) {
      response.total = await MasterTematikPemanfaatan.count({
        ...queryFind,
        include: includeCount,
      })
      response = {
        ...response,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / limit),
      }
    }

    return response
  }

  static async findById(id) {
    const data = await MasterTematikPemanfaatan.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Tematik tidak ditemukan')
    return data
  }
}

export default MasterTematikPemanfaatanService
