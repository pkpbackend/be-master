import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import fs from 'fs/promises'
import { Op } from 'sequelize'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
const { Desa, Kecamatan, City, Provinsi } = models

class DesaService {
  static async findAll(req) {
    let options = {
      withTotal: true,
      includes: [],
      where: {},
      query: req.query,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(options.query, Desa, options?.includes || [])

    queryFind.where = {
      ...queryFind.where,
      ...options?.where,
    }

    const data = await Desa.findAll({
      ...queryFind,
      // order: order.length ? order : [['createdAt', 'desc']],
    })

    return data
  }

  static async findById(id) {
    const desa = await Desa.findOne({
      where: { id },
      include: {
        model: Kecamatan,
        include: {
          model: City,
          include: {
            model: Provinsi,
          },
        },
      },
    })

    if (!desa) {
      throw new ResponseError.NotFound('desa tidak ditemukan')
    }

    return desa
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
        Desa,
        PluginSqlizeQuery.makeIncludeQueryable(query.filtered, [
          {
            model: Kecamatan,
            include: [{ model: City, include: [{ model: Provinsi }] }],
          },
        ])
      )

    const data = await Desa.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })
    const total = await Desa.count({
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

    return {
      rows,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalRows: count,
    }
  }

  static async uploadGeojson(id, batasWilayah) {
    if (!batasWilayah)
      throw new ResponseError.BadRequest('batasWilayah belum diisi')

    const desa = await Desa.findByPk(id)
    if (!desa) throw new ResponseError.NotFound('Desa tidak ditemukan')

    const batasWilayahSource = batasWilayah.path
    const batasWilayahName = batasWilayah.filename

    let s3url
    const s3key = `wilayah/desa/${batasWilayahName}`

    try {
      s3url = await uploadFileToS3(batasWilayahSource, s3key)
      await fs.unlink(batasWilayahSource)
    } catch {
      throw new ResponseError.BadRequest('Upload batasWilayah gagal!')
    }

    batasWilayah.isS3 = true
    batasWilayah.s3url = s3url

    await desa.update({
      geojson: batasWilayah,
    })

    return desa
  }

  static async create({
    nama,
    KecamatanId,
    kode_dagri,
    kode_bps,
    kode_rkakl,
    latitude,
    longitude,
    zoom,
  }) {
    if (!KecamatanId)
      throw new ResponseError.BadRequest('Kecamatan Id harus diisi')

    if (!nama) throw new ResponseError.BadRequest('nama harus diisi')

    if (!kode_dagri)
      throw new ResponseError.BadRequest('kode dagri harus diisi')

    let kodeDagri = kode_dagri.replace(/[^0-9]/g, '')

    const existingDagri = await Desa.findOne({
      where: {
        id: kodeDagri,
      },
    })

    if (existingDagri) {
      throw new ResponseError.BadRequest('kode dagri telah digunakan')
    }

    if (kode_bps) {
      const existingBPS = await Desa.findOne({
        where: {
          kode_bps: kode_bps,
        },
      })

      if (existingBPS) {
        throw new ResponseError.BadRequest('kode bps telah digunakan')
      }
    }

    if (kode_rkakl) {
      const existingRKAKL = await Desa.findOne({
        where: {
          kode_rkakl: kode_rkakl,
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('kode rkakl telah digunakan')
      }
    }

    const data = await Desa.create({
      nama,
      KecamatanId,
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
    {
      nama,
      KecamatanId,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    }
  ) {
    if (!KecamatanId)
      throw new ResponseError.BadRequest('Kecamatan Id harus diisi')

    if (!nama) throw new ResponseError.BadRequest('nama harus diisi')

    if (kode_dagri)
      throw new ResponseError.BadRequest('Kode Dagri tidak dapat diupdate')

    const desa = await Desa.findByPk(id)

    if (!desa) throw new ResponseError.NotFound('Desa tidak ditemukan')

    if (kode_bps) {
      const existingBPS = await Desa.findOne({
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
      const existingRKAKL = await Desa.findOne({
        where: {
          kode_rkakl: kode_rkakl,
          id: { [Op.ne]: id },
        },
      })

      if (existingRKAKL) {
        throw new ResponseError.BadRequest('Kode RKAKL telah digunakan')
      }
    }

    desa.nama = nama
    desa.KecamatanId = KecamatanId
    desa.kode_bps = kode_bps
    desa.kode_rkakl = kode_rkakl
    desa.latitude = latitude
    desa.longitude = longitude
    desa.zoom = zoom

    await desa.save()

    return desa
  }

  static async delete(id) {
    const desa = await Desa.findByPk(id)

    if (!desa) {
      throw new ResponseError.NotFound('Desa tidak ditemukan')
    }

    const geojson = desa.geojson

    if (geojson) {
      const filename = geojson.filename
      const s3key = `wilayah/desa/${filename}`

      try {
        await removeS3File(s3key)
      } catch (err) {
        console.log(err)
        throw new ResponseError.BadRequest('Gagal menghapus file pada S3')
      }
    }

    await desa.destroy()
  }
}

export default DesaService
