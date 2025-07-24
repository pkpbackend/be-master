import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import _ from 'lodash'

const {
  Helpdesk,
  HelpdeskChat,
  HelpdeskTopikDiskusi,
  HelpdeskUser,
  Direktorat,
  Provinsi,
} = models

class HelpdeskService {
  static async plainQuery(
    req,
    options = {
      withTotal: false,
      includes: [],
      where: {},
    }
  ) {
    try {
      const { includeCount, order, limit, ...queryFind } =
        PluginSqlizeQuery.generate(req.query, Helpdesk, options?.includes || [])

      queryFind.where = {
        ...queryFind.where,
        ...options?.where,
      }

      const data = await Helpdesk.findAll({
        ...queryFind,
        order: order.length ? order : [['createdAt', 'desc']],
        limit,
      })

      const response = {
        message: 'success',
        data,
        page: queryFind.offset ? queryFind.offset / limit + 1 : 1,
        pageSize: limit,
      }

      if (options?.withTotal) {
        response.totalRow = await Helpdesk.count({
          ...queryFind,
          include: includeCount,
        })

        response.pages = Math.ceil(
          response.totalRow / (limit || response.totalRow)
        )
      }

      return response
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return { message }
    }
  }

  static async findAll(req) {
    return await this.plainQuery(req, {
      includes: [
        {
          model: HelpdeskTopikDiskusi,
          as: 'topikDiskusi',
        },
        {
          model: HelpdeskUser,
          as: 'user',
        },
        {
          model: Direktorat,
        },
      ],

      withTotal: true,
    })
  }

  static async findAllChat(req) {
    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(req.query, HelpdeskChat, [
        {
          model: HelpdeskUser,
        },
      ])

    const data = await HelpdeskChat.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })

    const total = await HelpdeskChat.count({
      where: queryFind.where,
      include: includeCount,
    })

    return {
      message: 'success',
      total,
      data,
    }
  }

  static async findOne(req) {
    const data = await Helpdesk.findByPk(req.params.id, {
      include: [
        {
          model: HelpdeskTopikDiskusi,
          as: 'topikDiskusi',
        },
        {
          model: HelpdeskUser,
          as: 'user',
          include: [
            {
              model: Provinsi,
            },
          ],
        },
        {
          model: HelpdeskUser,
          as: 'endBy',
          include: [
            {
              model: Provinsi,
            },
          ],
        },
        {
          model: Direktorat,
        },
      ],
      logging: console.log,
    })
    if (!data) {
      throw new ResponseError.NotFound('Helpdesk data not found')
    }

    return {
      message: 'success',
      data,
    }
  }

  static async create(req, res) {
    const payload = req.body
    const data = {}
    const trx = await Helpdesk.sequelize?.transaction()
    const profile = res.locals?.profile

    try {
      if (payload?.HelpdeskUser && !payload?.Helpdesk?.HelpdeskUserId) {
        data.HelpdeskUser = await HelpdeskUser.create(payload.HelpdeskUser, {
          returning: true,
          transaction: trx,
        })

        payload.Helpdesk.HelpdeskUserId = data.HelpdeskUser.getDataValue('id')
      } else if (
        !payload?.HelpdeskUser &&
        !payload?.Helpdesk?.HelpdeskUserId &&
        !_.isEmpty(profile)
      ) {
        const chekHelpdeskUser = await HelpdeskUser.findOne({
          where: {
            internalUserId: profile?.id,
          },
        })

        if (!chekHelpdeskUser) {
          const createNewUser = await HelpdeskUser.create(
            {
              name: profile?.name,
              email: profile?.email,
              phone: profile?.phone,
              internalUserId: profile.id,
              internalUserDetail: JSON.stringify(profile),
            },
            {
              returning: true,
            }
          )

          payload.HelpdeskUserId = createNewUser.getDataValue('id')
        } else {
          payload.HelpdeskUserId = chekHelpdeskUser.getDataValue('id')
        }
      }

      if (payload?.Helpdesk) {
        data.Helpdesk = await Helpdesk.create(payload.Helpdesk, {
          returning: true,
          transaction: trx,
        })
      }

      await trx.commit()
      return {
        message: 'success',
        data,
      }
    } catch (error) {
      await trx.rollback()
      console.error(error)
      return {
        message: error.message,
      }
    }
  }

  static async update(req, res) {
    const payload = { ...req.body }
    const profile = res.locals?.profile
    const data = await Helpdesk.findByPk(req.params.id)
    if (!data) {
      throw new ResponseError.NotFound('Helpdesk data not found')
    }

    if (_.has(payload, 'status')) {
      if (payload.status === true) {
        if (_.has(payload, 'HelpdeskUserId')) {
          payload.endedBy = payload.HelpdeskUserId

          delete payload.HelpdeskUserId
        } else if (!_.isEmpty(profile)) {
          const helpdeskUser = await HelpdeskUser.findOne({
            where: {
              internalUserId: profile?.id,
            },
          })

          if (helpdeskUser) {
            payload.endedBy = helpdeskUser.getDataValue('id')
          }
        } else {
          throw new ResponseError.BadRequest(
            'HelpdeskUserId is required to update Helpdesk status data'
          )
        }
      }
    }

    const update = await data.update(payload)
    return {
      message: 'success',
      data: update,
    }
  }

  static async delete(req) {
    const data = await Helpdesk.findByPk(req.params.id)
    if (!data) {
      throw new ResponseError.NotFound('Helpdesk data not found')
    }
    await data.destroy()
    return {
      message: 'success',
      data,
    }
  }

  static async createChat(req, res) {
    const payload = req.body
    const profile = res.locals?.profile

    if (!payload.HelpdeskUserId) {
      const checkUser = await HelpdeskUser.findOne({
        where: {
          internalUserId: res.locals.profile.id,
        },
      })

      if (checkUser) {
        payload.HelpdeskUserId = checkUser.getDataValue('id')
      } else if (!checkUser && profile) {
        const createNewUser = await HelpdeskUser.create(
          {
            name: profile?.name,
            email: profile?.email,
            phone: profile?.phone,
            internalUserId: profile.id,
            internalUserDetail: JSON.stringify(profile),
          },
          {
            returning: true,
          }
        )

        payload.HelpdeskUserId = createNewUser.getDataValue('id')
      }
    }

    const data = await HelpdeskChat.create(payload, {
      returning: true,
    })

    return {
      message: 'success',
      data,
    }
  }

  static async resetTopdis(req) {
    const trx = await Helpdesk.sequelize?.transaction()

    const createData = [
      {
        name: 'Persyaratan Administrasi',
      },
      {
        name: 'Verifikasi',
      },
      {
        name: 'Status Usulan',
      },
      {
        name: 'Lainnya',
      },
    ]

    try {
      // check apakah sudah ada sebanyak 4 data topik diskusi
      const count = await HelpdeskTopikDiskusi.count()

      if (count > 0 && count !== 4) {
        // hapus semua data topik diskusi
        await HelpdeskTopikDiskusi.destroy({
          where: {},
          truncate: true,
          // walaupun ada referensi ke tabel lain, tetap dihapus
          force: true,
          transaction: trx,
        })
      } else if (count === 4) {
        throw new ResponseError.BadRequest(`Topik diskusi sudah ada ${count}`)
      }

      const data = await HelpdeskTopikDiskusi.bulkCreate(createData, {
        returning: true,
        transaction: trx,
      })

      await trx.commit()
      return {
        message: 'success',
        data,
      }
    } catch (error) {
      await trx.rollback()
      console.error(error)
      return {
        message: error.message,
      }
    }
  }

  static async getTopdis(req) {
    const data = await HelpdeskTopikDiskusi.findAll()

    return {
      message: 'success',
      data,
    }
  }

  static async getMyProfile(req, res) {
    return {
      message: 'success',
      data: res.locals.profile,
    }
  }
}

export default HelpdeskService
