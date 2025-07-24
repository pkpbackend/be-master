import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { ProKegiatan } = models

class ProKegiatanService {
  static async plainQueryProKegiatan(
    req,
    res,
    options = {
      withTotal: false,
      includes: [],
      where: {},
    }
  ) {
    try {
      const { includeCount, order, limit, ...queryFind } =
        PluginSqlizeQuery.generate(
          req.query,
          ProKegiatan,
          options?.includes || []
        )

      queryFind.where = {
        ...queryFind.where,
        ...options?.where,
      }

      const data = await ProKegiatan.findAll({
        ...queryFind,
        order: order.length ? order : [['createdAt', 'desc']],
        limit,
      })

      const response = {
        message: 'success',
        data,
      }

      if (options?.withTotal) {
        response.total = await ProKegiatan.count({
          ...queryFind,
          include: includeCount,
        })
      }

      return res.status(200).json(response)
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return res.status(500).json({ message })
    }
  }

  static async findAll(req, res) {
    return await this.plainQueryProKegiatan(req, res, {
      withTotal: true,
      includes: [],
    })
  }

  static async findById(id) {
    const data = await ProKegiatan.findByPk(id)
    if (!data) throw new ResponseError.NotFound('ProKegiatan tidak ditemukan')
    return data
  }
}

export default ProKegiatanService
