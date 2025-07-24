import { EXAPI_RTLH_KEY } from '../../config/env'
import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { mkExapiRTLH } from '../../helpers/externalApi'
import fs from 'fs/promises'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import { Op } from 'sequelize'

const { City, Provinsi } = models

class CityService {
  static async findAll(query, profile) {
    const { ProvinsiId, CityId } = profile
    const { ...queryFind } = PluginSqlizeQuery.generate(
      query,
      City,
      PluginSqlizeQuery.makeIncludeQueryable(query?.filtered, [])
    )
    const { where } = queryFind

    let newWhere = { ...where }

    if (profile.Role.id != 11) {
      // Filter by provinsi user active
      if (ProvinsiId) {
        newWhere = {
          ...where,
          ProvinsiId,
        }
      }

      // Filter by city user active
      if (CityId) {
        newWhere = {
          ...where,
          id: CityId,
        }
      }
    }

    const data = await City.findAll({
      where: newWhere,
      // order: [['createdAt', 'DESC']]
    })

    return data
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
      PluginSqlizeQuery.generate(
        query,
        City,
        PluginSqlizeQuery.makeIncludeQueryable(query.filtered, [
          { model: Provinsi },
        ])
      )

    const data = await City.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })
    const total = await City.count({
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
    const city = await City.findOne({
      where: { id },
      include: { model: Provinsi },
    })

    if (!city) throw new ResponseError.NotFound('Data tidak ditemukan')

    return city
  }

  static async create({
    nama,
    ProvinsiId,
    latitude,
    longitude,
    zoom,
    kode_dagri,
    kode_bps,
    kode_rkakl,
  }) {
    if (!nama) {
      throw new ResponseError.BadRequest(' Nama Kota belum diisi')
    }
    if (!ProvinsiId) {
      throw new ResponseError.BadRequest('ProvinsiId belum diisi')
    }
    if (!latitude) {
      throw new ResponseError.BadRequest('latitude belum diisi')
    }
    if (!longitude) {
      throw new ResponseError.BadRequest('longitude belum diisi')
    }
    if (!kode_dagri) {
      throw new ResponseError.BadRequest('kode_dagri belum diisi')
    }

    let kodeDagri = kode_dagri.replace(/[^0-9]/g, '')

    const existingDagri = await City.findOne({
      where: {
        kode_dagri: kodeDagri,
      },
    })

    if (existingDagri) {
      throw new ResponseError.BadRequest('kode dagri telah digunakan')
    }

    if (kode_bps) {
      const existingBPS = await City.findOne({
        where: {
          kode_bps: kode_bps,
        },
      })

      if (existingBPS) {
        throw new ResponseError.BadRequest('kode bps telah digunakan')
      }
    }

    if (kode_rkakl) {
      const existingRKAKL = await City.findOne({
        where: {
          kode_rkakl: kode_rkakl,
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('kode rkakl telah digunakan')
      }
    }

    const newData = await City.create({
      nama,
      ProvinsiId,
      latitude,
      longitude,
      zoom,
      kode_dagri: kodeDagri,
      kode_bps,
      kode_rkakl,
    })

    return newData
  }

  static async uploadGeojson(id, batasWilayah) {
    if (!batasWilayah)
      throw new ResponseError.BadRequest('Dokumen Geojson belum diisi')

    const city = await City.findByPk(id)
    if (!city) throw new ResponseError.NotFound('Data tidak ditemukan')

    const batasWilayahSource = batasWilayah.path
    const batasWilayahName = batasWilayah.filename

    let s3url
    const s3key = `wilayah/city/${batasWilayahName}`

    try {
      s3url = await uploadFileToS3(batasWilayahSource, s3key)
      await fs.unlink(batasWilayahSource)
    } catch {
      throw new ResponseError.BadRequest('Upload Dokumen SBU gagal!')
    }

    batasWilayah.isS3 = true
    batasWilayah.s3url = s3url

    await city.update({
      geojson: batasWilayah,
    })

    return city
  }

  static async update(
    id,
    {
      nama,
      ProvinsiId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    }
  ) {
    const city = await City.findByPk(id)

    if (!city) {
      throw new ResponseError.NotFound('city tidak ditemukan!')
    }

    if (!nama) {
      throw new ResponseError.BadRequest('Nama komponen pengajuan belum diisi')
    }
    if (!ProvinsiId) {
      throw new ResponseError.BadRequest('ProvinsiId belum diisi')
    }
    if (!latitude) {
      throw new ResponseError.BadRequest('latitude belum diisi')
    }
    if (!longitude) {
      throw new ResponseError.BadRequest('longitude belum diisi')
    }
    if (kode_dagri) {
      throw new ResponseError.BadRequest('Kode dagri tidak dapat diupdate')
    }

    if (kode_bps) {
      const existingBPS = await City.findOne({
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
      const existingRKAKL = await City.findOne({
        where: {
          kode_rkakl: kode_rkakl,
          id: { [Op.ne]: id },
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('Kode RKAKL telah digunakan')
      }
    }

    city.nama = nama
    city.ProvinsiId = ProvinsiId
    city.latitude = latitude
    city.longitude = longitude
    city.zoom = zoom
    city.kode_dagri = kode_dagri
    city.kode_bps = kode_bps
    city.kode_rkakl = kode_rkakl

    await city.save()

    return city
  }

  static async delete(id) {
    const city = await City.findByPk(id)
    if (!city) throw new ResponseError.NotFound('Data tidak ditemukan')

    const geojson = city.geojson

    if (geojson) {
      const filename = geojson.filename
      const s3key = `wilayah/city/${filename}`

      try {
        await removeS3File(s3key)
      } catch (err) {
        console.log(err)
        throw new ResponseError.BadRequest('Gagal menghapus file pada S3')
      }
    }

    await city.destroy()
  }
}

export default CityService
