import ResponseError from '../../modules/Error'
import models from '../../database/models'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import { convertQueryFilterLike } from '../../helpers/ConvertQuery'

const { KomponenPengajuan } = models

class KomponenPengajuanService {
  static async findAll(req, res) {
    try {
      const { includeCount, order, limit, ...queryFind } =
        PluginSqlizeQuery.generate(req.query, KomponenPengajuan)

      const queryFindV2 = convertQueryFilterLike(queryFind, req)

      const data = await KomponenPengajuan.findAll({
        ...queryFindV2,
        order: order.length ? order : [['createdAt', 'desc']],
        limit,
      })

      const response = {
        message: 'success',
        data,
      }

      response.total = await KomponenPengajuan.count({
        ...queryFindV2,
        include: includeCount,
      })

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

  static async create({ name, UsulanTypeId }) {
    if (!name) {
      throw new ResponseError.BadRequest('Nama komponen pengajuan belum diisi')
    }

    const newData = await KomponenPengajuan.create({
      name,
      UsulanTypeId,
    })

    return newData
  }

  static async findById(id) {
    const pengajuan = await KomponenPengajuan.findByPk(id)
    if (!pengajuan) throw new ResponseError.NotFound('Data tidak ditemukan')
    return pengajuan
  }

  static async update(id, { name, UsulanTypeId }) {
    const pengajuan = await KomponenPengajuan.findByPk(id)

    if (!name) {
      throw new ResponseError.BadRequest('Nama komponen pengajuan belum diisi')
    }

    ;(pengajuan.name = name), (pengajuan.UsulanTypeId = UsulanTypeId)

    await pengajuan.save()

    return pengajuan
  }

  static async delete(id) {
    const pengajuan = await KomponenPengajuan.findByPk(id)
    if (!pengajuan) throw new ResponseError.NotFound('Data tidak ditemukan')
    await pengajuan.destroy()
  }
}

export default KomponenPengajuanService
