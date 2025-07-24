import sequelize from 'sequelize'
import { Op } from 'sequelize'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import models from '../../database/models'
import ResponseError from '../../modules/Error'

const {
  MasterKategoriDokumen,
  MasterDokumen,
} = models

class MasterKategoriDokumenService {

  static async findAll({
    name,
    description,
    DirektoratId,
  }) {
    const conditions = {}

    if (name) {
      conditions.name = {
        [Op.like]: `%${name}%`,
      }
    }

    if (description) {
      conditions.description = {
        [Op.like]: `%${description}%`,
      }
    }

    if (DirektoratId) {
      conditions.DirektoratId = DirektoratId
    }

    const masterKategoriDokumens = await MasterKategoriDokumen.findAll({
      include: [{
        model: MasterDokumen,
        attributes: [
          'id',
          [sequelize.literal("if(maxSize is null, nama, concat(nama, ' (', maxSize, ' MB)'))"), 'nama'],
          'model',
          'jenisData',
          'jenisDirektif',
          'required',
          'type',
          'MasterKategoriDokumenId',
          'maxSize',
          'typeFile',
          'ditRusunField',
          'jenisBantuan',
          'sort',
          'formatDokumen',
          'createdAt',
          'updatedAt'
        ],
      }],
      where: conditions,
      order: [[{ model: MasterDokumen }, 'sort', 'asc']]
    })

    return masterKategoriDokumens
  }

  static async findAllPaginate(query) {
    const { page = 1, pageSize = 10 } = query

    const { ...queryFind } = PluginSqlizeQuery.generate(
      query,
      MasterKategoriDokumen,
      PluginSqlizeQuery.makeIncludeQueryable(query?.filtered, [])
    )
    const { where, offset, limit } = queryFind

    const { count, rows } = await MasterKategoriDokumen.findAndCountAll({
      // include: { model: MasterDokumen },
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    })

    return {
      data: rows,
      totalRow: count,
      page,
      pageSize,
      pages: Math.ceil(count / pageSize),
    }
  }

  static async findById(id) {
    const masterKategoriDokumen = await MasterKategoriDokumen.findByPk(id)
    if (!masterKategoriDokumen) throw new ResponseError.NotFound('Kategori Dokumen tidak ditemukan')
    return masterKategoriDokumen
  }

  static async create({
    name,
    description,
    DirektoratId,
  }) {
    if (!name) {
      throw new ResponseError.BadRequest('Nama belum diisi')
    }

    if (!DirektoratId) {
      throw new ResponseError.BadRequest('Direktorat ID belum diisi')
    }

    const masterKategoriDokumen = await MasterKategoriDokumen.create({
      name,
      description,
      DirektoratId,
    })

    if (!masterKategoriDokumen) {
      throw new ResponseError.BadRequest('Gagal membuat Kategori Dokumen')
    }

    return masterKategoriDokumen
  }

  static async update(id, {
    name,
    description,
    DirektoratId,
  }) {
    if (!name) {
      throw new ResponseError.BadRequest('Nama belum diisi')
    }

    if (!DirektoratId) {
      throw new ResponseError.BadRequest('Direktorat ID belum diisi')
    }

    const masterKategoriDokumen = await MasterKategoriDokumen.findByPk(id)

    if (!masterKategoriDokumen) {
      throw new ResponseError.NotFound('Kategori Dokumen tidak ditemukan')
    }

    masterKategoriDokumen.name = name
    masterKategoriDokumen.description = description
    masterKategoriDokumen.DirektoratId = DirektoratId

    await masterKategoriDokumen.save()

    return masterKategoriDokumen
  }

  static async delete(id) {
    const masterKategoriDokumen = await MasterKategoriDokumen.findByPk(id)
    if (!masterKategoriDokumen) throw new ResponseError.NotFound('Kategori Dokumen tidak ditemukan')
    await masterKategoriDokumen.destroy()
  }

}

export default MasterKategoriDokumenService