import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { ProProgram } = models

class ProProgramService {
  static async plainQueryProProgram(
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
          ProProgram,
          options?.includes || []
        )

      queryFind.where = {
        ...queryFind.where,
        ...options?.where,
      }

      const data = await ProProgram.findAll({
        ...queryFind,
        order: order.length ? order : [['createdAt', 'desc']],
        limit,
      })

      const response = {
        message: 'success',
        data,
      }

      if (options?.withTotal) {
        response.total = await ProProgram.count({
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
    return await this.plainQueryProProgram(req, res, {
      withTotal: true,
      includes: [],
    })
  }

  static async findById(id) {
    const data = await ProProgram.findByPk(id)
    if (!data) throw new ResponseError.NotFound('ProProgram tidak ditemukan')
    return data
  }
}

export default ProProgramService
