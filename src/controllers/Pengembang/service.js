import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import _ from 'lodash'
import { Op } from 'sequelize'

const { Pengembang } = models

class PengembangService {
  static async findAll(query) {
    let conditions = {}

    if (typeof query.isValid === 'boolean') {
      conditions = {
        ...conditions,
        isValid: query.isValid,
      }
    }

    const data = await Pengembang.findAll({
      where: conditions,
    })
    const total = await Pengembang.count({
      where: conditions,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findAllPaginate(req) {
    let { pageSize, page, filtered } = req.query
    pageSize = isNaN(pageSize) ? 10 : parseInt(pageSize)
    page = isNaN(page) ? 1 : parseInt(page)

    filtered =
      ['undefined', 'null', null, undefined].indexOf(filtered) === -1
        ? JSON.parse(filtered)
        : {}

    const indexIsSikumbang = _.findIndex(
      filtered,
      (item) => item.id === 'isSikumbang'
    )
    let isSikumbang = _.find(filtered, (item) => item.id === 'isSikumbang')
    if (Array.isArray(filtered) && indexIsSikumbang !== -1)
      filtered.splice(indexIsSikumbang, 1)

    let query = {
      ...req.query,
      filtered,
      pageSize,
      page,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(query, Pengembang, [])

    if (isSikumbang) {
      queryFind.where = {
        ...queryFind.where,
        IdPengembangSikumbang:
          isSikumbang.value === 'true'
            ? {
                [Op.ne]: null,
              }
            : null,
      }
    }

    const data = await Pengembang.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })
    const total = await Pengembang.count({
      ...queryFind,
      include: includeCount,
    })
    return {
      message: 'success',
      total,
      data,
      page,
      pageSize,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async findById(id) {
    const data = await Pengembang.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Pengembang tidak ditemukan')
    return data
  }

  static async findByNPWP(npwp) {
    const data = await Pengembang.findOne({
      where: {
        npwp,
      },
    })
    if (!data) throw new ResponseError.NotFound('Pengembang tidak ditemukan')
    return data
  }

  static async findByNPWPorEmail({ npwp, email }) {
    let data = await Pengembang.findOne({
      where: {
        npwp,
      },
    })

    if (!data) {
      data = await Pengembang.findOne({
        where: {
          email,
        },
      })
    }

    if (!data) throw new ResponseError.NotFound('Pengembang tidak ditemukan')
    return data
  }

  static async update(
    id,
    { nama, namaPerusahaan, telpPenanggungJawab, email, npwp }
  ) {
    const pengembang = await Pengembang.findByPk(id)

    if (!nama) {
      throw new ResponseError.BadRequest('Nama pengembang belum diisi')
    }
    if (!namaPerusahaan) {
      throw new ResponseError.BadRequest('Nama perusahaan belum diisi')
    }
    if (!telpPenanggungJawab) {
      throw new ResponseError.BadRequest('nomor telfon belum diisi')
    }
    if (!email) {
      throw new ResponseError.BadRequest('email belum diisi')
    }

    pengembang.nama = nama
    pengembang.namaPerusahaan = namaPerusahaan
    pengembang.telpPenanggungJawab = telpPenanggungJawab
    pengembang.email = email
    pengembang.npwp = npwp
    await pengembang.save()

    return pengembang
  }

  static async delete(id) {
    const pengembang = await Pengembang.findByPk(id)
    if (!pengembang) throw new ResponseError.NotFound('Data tidak ditemukan')
    await pengembang.destroy()
  }

  static async create(req) {
    const pengembang = await Pengembang.create(req.body)
    return pengembang
  }
}

export default PengembangService
