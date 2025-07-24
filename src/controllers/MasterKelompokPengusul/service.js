import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { MasterKelompokPengusul } = models

class MasterKelompokPengusulService {

  static async findAll() {
    const data = await MasterKelompokPengusul.findAll()
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
        MasterKelompokPengusul,
        options?.includes || []
      )

    queryFind.where = {
      ...queryFind.where,
      ...options?.where,
    }

    const data = await MasterKelompokPengusul.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })

    let response = {
      message: 'success',
      data,
    }

    if (options?.withTotal) {
      response.total = await MasterKelompokPengusul.count({
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
    const data = await MasterKelompokPengusul.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Tematik tidak ditemukan')
    return data
  }
}

export default MasterKelompokPengusulService
