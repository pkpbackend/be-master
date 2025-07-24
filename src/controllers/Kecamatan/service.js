import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { mkExapiRTLH } from '../../helpers/externalApi'
import fs from 'fs/promises'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import { Op } from 'sequelize'

const { Kecamatan, City, Provinsi } = models

class KecamatanService {
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
        Kecamatan,
        options?.includes || []
      )

    queryFind.where = {
      ...queryFind.where,
      ...options?.where,
    }

    const data = await Kecamatan.findAll({
      ...queryFind,
      // order: order.length ? order : [['createdAt', 'desc']],
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
        Kecamatan,
        PluginSqlizeQuery.makeIncludeQueryable(query.filtered, [
          {
            model: City,
            include: [
              {
                model: Provinsi,
              },
            ],
          },
        ])
      )

    const data = await Kecamatan.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })
    const total = await Kecamatan.count({
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
    const kecamatan = await Kecamatan.findOne({
      where: { id },
      include: {
        model: City,
        include: {
          model: Provinsi,
        },
      },
    })

    if (!kecamatan) throw new ResponseError.NotFound('Data tidak ditemukan')

    return kecamatan
  }

  static async create({
    nama,
    CityId,
    latitude,
    longitude,
    zoom,
    kode_dagri,
    kode_bps,
    kode_rkakl,
  }) {
    if (!nama) {
      throw new ResponseError.BadRequest('nama belum diisi')
    }
    if (!CityId) {
      throw new ResponseError.BadRequest('CityId belum diisi')
    }
    if (!kode_dagri) {
      throw new ResponseError.BadRequest('kode_dagri belum diisi')
    }

    let kodeDagri = kode_dagri.replace(/[^0-9]/g, '')

    const existingDagri = await Kecamatan.findOne({
      where: {
        kode_dagri: kodeDagri,
      },
    })

    if (existingDagri) {
      throw new ResponseError.BadRequest('kode dagri telah digunakan')
    }

    if (kode_bps) {
      const existingBPS = await Kecamatan.findOne({
        where: {
          kode_bps: kode_bps,
        },
      })

      if (existingBPS) {
        throw new ResponseError.BadRequest('kode bps telah digunakan')
      }
    }

    if (kode_rkakl) {
      const existingRKAKL = await Kecamatan.findOne({
        where: {
          kode_rkakl: kode_rkakl,
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('kode rkakl telah digunakan')
      }
    }

    const newData = await Kecamatan.create({
      nama,
      CityId,
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

    const kecamatan = await Kecamatan.findByPk(id)
    if (!kecamatan) throw new ResponseError.NotFound('Data tidak ditemukan')

    const batasWilayahSource = batasWilayah.path
    const batasWilayahName = batasWilayah.filename

    let s3url
    const s3key = `wilayah/kecamatan/${batasWilayahName}`

    try {
      s3url = await uploadFileToS3(batasWilayahSource, s3key)
      await fs.unlink(batasWilayahSource)
    } catch {
      throw new ResponseError.BadRequest('Upload Dokumen SBU gagal!')
    }

    batasWilayah.isS3 = true
    batasWilayah.s3url = s3url

    await kecamatan.update({
      geojson: batasWilayah,
    })

    return kecamatan
  }

  static async update(
    id,
    {
      nama,
      CityId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    }
  ) {
    const kecamatan = await Kecamatan.findByPk(id)

    if (!nama) {
      throw new ResponseError.BadRequest(' Nama Kecamatan belum diisi')
    }
    if (!CityId) {
      throw new ResponseError.BadRequest('CityId belum diisi')
    }
    if (kode_dagri) {
      throw new ResponseError.BadRequest('kode_dagri tidak dapat diupdate')
    }

    if (!kecamatan) {
      throw new ResponseError.BadRequest('Data tidak ada')
    }

    if (kode_bps) {
      const existingBPS = await Kecamatan.findOne({
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
      const existingRKAKL = await Kecamatan.findOne({
        where: {
          kode_rkakl: kode_rkakl,
          id: { [Op.ne]: id },
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('Kode RKAKL telah digunakan')
      }
    }

    kecamatan.nama = nama
    kecamatan.CityId = CityId
    kecamatan.latitude = latitude
    kecamatan.longitude = longitude
    kecamatan.zoom = zoom
    kecamatan.kode_dagri = kode_dagri
    kecamatan.kode_bps = kode_bps
    kecamatan.kode_rkakl = kode_rkakl

    await kecamatan.save()

    return kecamatan
  }

  static async delete(id) {
    const kecamatan = await Kecamatan.findByPk(id)
    if (!kecamatan) throw new ResponseError.NotFound('Data tidak ditemukan')

    const geojson = kecamatan.geojson

    if (geojson) {
      const filename = geojson.filename
      const s3key = `wilayah/kecamatan/${filename}`
      
      try {
        await removeS3File(s3key)
      } catch (err) {
        console.log(err)
        throw new ResponseError.BadRequest('Gagal menghapus file pada S3')
      }
    }

    await kecamatan.destroy()
  }
}

export default KecamatanService
