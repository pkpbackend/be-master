import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import fs from 'fs/promises'
import { Op } from 'sequelize'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { Provinsi } = models

class ProvinsiService {
  static async findAll(query, profile) {
    const { ProvinsiId } = profile
    const { ...queryFind } = PluginSqlizeQuery.generate(
      query,
      Provinsi,
      PluginSqlizeQuery.makeIncludeQueryable(query?.filtered, [])
    )
    const { where } = queryFind

    let newWhere = { ...where }

    if (profile.Role.id != 11) {
      // Filter by provinsi user active
      if (ProvinsiId) {
        newWhere = {
          ...where,
          id: ProvinsiId,
        }
      }
    }

    const data = await Provinsi.findAll({
      where: newWhere,
      // order: [['createdAt', 'DESC']]
    })

    return data
  }

  static async findById(id) {
    const provinsi = await Provinsi.findByPk(id)

    if (!provinsi) {
      throw new ResponseError.NotFound('Provinsi tidak ditemukan')
    }

    return provinsi
  }

  static async findAllPaginate(req) {
    let { pageSize, page } = req.query
    pageSize = isNaN(pageSize) ? 10 : parseInt(pageSize)
    page = isNaN(page) ? 1 : parseInt(page)

    let query = {
      ...req.query,
      pageSize,
      page,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(query, Provinsi, [])

    const data = await Provinsi.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })
    const total = await Provinsi.count({
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

  static async uploadGeojson(id, batasWilayah) {
    if (!batasWilayah)
      throw new ResponseError.BadRequest('BatasWilayah belum diisi')

    const provinsi = await Provinsi.findByPk(id)
    if (!provinsi) throw new ResponseError.NotFound('Provinsi tidak ditemukan')

    const batasWilayahSource = batasWilayah.path
    const batasWilayahName = batasWilayah.filename

    let s3url
    const s3key = `wilayah/provinsi/${batasWilayahName}`

    try {
      s3url = await uploadFileToS3(batasWilayahSource, s3key)
      await fs.unlink(batasWilayahSource)
    } catch {
      throw new ResponseError.BadRequest('Upload batasWilayah gagal!')
    }

    batasWilayah.isS3 = true
    batasWilayah.s3url = s3url

    await provinsi.update({
      geojson: batasWilayah,
    })

    return provinsi
  }

  static async create({
    nama,
    kode_dagri,
    kode_bps,
    kode_rkakl,
    latitude,
    longitude,
    zoom,
  }) {
    if (!nama) throw new ResponseError.BadRequest('nama harus diisi')

    if (!kode_dagri)
      throw new ResponseError.BadRequest('kode dagri harus diisi')

    if (!latitude) throw new ResponseError.BadRequest('latitude harus diisi')

    if (!longitude) throw new ResponseError.BadRequest('longitude harus diisi')

    let kodeDagri = kode_dagri.replace(/[^0-9]/g, '')

    const existingDagri = await Provinsi.findOne({
      where: {
        kode_dagri: kodeDagri,
      },
    })

    if (existingDagri) {
      throw new ResponseError.BadRequest('kode dagri telah digunakan')
    }

    if (kode_bps) {
      const existingBPS = await Provinsi.findOne({
        where: {
          kode_bps,
        },
      })

      if (existingBPS) {
        throw new ResponseError.BadRequest('kode bps telah digunakan')
      }
    }

    if (kode_rkakl) {
      const existingRKAKL = await Provinsi.findOne({
        where: {
          kode_rkakl,
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('kode rkakl telah digunakan')
      }
    }

    const data = await Provinsi.create({
      nama,
      kode_dagri: kodeDagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    })

    return data
  }

  static async update(
    id,
    { nama, kode_dagri, kode_bps, kode_rkakl, latitude, longitude, zoom }
  ) {
    if (kode_dagri) {
      throw new ResponseError.BadRequest('Kode dagri tidak dapat diupdate')
    }

    if (!nama) {
      throw new ResponseError.BadRequest('nama harus diisi')
    }

    if (!latitude) {
      throw new ResponseError.BadRequest('latitude harus diisi')
    }

    if (!longitude) {
      throw new ResponseError.BadRequest('longitude harus diisi')
    }

    const provinsi = await Provinsi.findByPk(id)

    if (!provinsi) {
      throw new ResponseError.NotFound('Provinsi tidak ditemukan!')
    }

    if (kode_bps) {
      const existingBPS = await Provinsi.findOne({
        where: {
          kode_bps: kode_bps,
          id: { [Op.ne]: id },
        },
      })

      if (existingBPS) {
        throw new ResponseError.BadRequest('Kode BPS telah digunakan')
      }
    }

    if (kode_rkakl) {
      const existingRKAKL = await Provinsi.findOne({
        where: {
          kode_rkakl: kode_rkakl,
          id: { [Op.ne]: id },
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('Kode RKAKL telah digunakan')
      }
    }

    provinsi.nama = nama
    provinsi.kode_bps = kode_bps
    provinsi.kode_rkakl = kode_rkakl
    provinsi.latitude = latitude
    provinsi.longitude = longitude
    provinsi.zoom = zoom

    await provinsi.save()

    return provinsi
  }

  static async delete(id) {
    const provinsi = await Provinsi.findByPk(id)

    if (!provinsi) {
      throw new ResponseError.NotFound('Provinsi tidak ditemukan')
    }

    const geojson = provinsi.geojson

    if (geojson) {
      const filename = geojson.filename
      const s3key = `wilayah/provinsi/${filename}`

      try {
        await removeS3File(s3key)
      } catch (err) {
        console.log(err)
        throw new ResponseError.BadRequest('Gagal menghapus file pada S3')
      }
    }

    await provinsi.destroy()
  }
}

export default ProvinsiService
