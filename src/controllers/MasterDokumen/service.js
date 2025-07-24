import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import models from '../../database/models'
import ResponseError from '../../modules/Error'

const { MasterDokumen, MasterKategoriDokumen, MasterDokumenSerahTerima } =
  models

class MasterDokumenService {
  static async findAll({ nama, model, DirektoratId, req }) {
    const conditions = {}
    const withLimit = req?.query?.withLimit || false

    req.query.withLimit = withLimit

    if (nama) {
      conditions.nama = nama
    }

    if (model) {
      conditions.model = model
    }

    if (DirektoratId) {
      conditions['$MasterKategoriDokumen.DirektoratId$'] = DirektoratId
    }

    const queryFind = PluginSqlizeQuery.generate(req.query, MasterDokumen, [
      { model: MasterKategoriDokumen },
    ])

    const masterDokumens = await MasterDokumen.findAll({
      ...queryFind,
      where: {
        ...queryFind.where,
        ...conditions,
      },
      // order: [['createdAt', 'DESC']]
    })

    return masterDokumens
  }

  static async findAllPaginate(query) {
    const { page = 1, pageSize = 10 } = query

    const { ...queryFind } = PluginSqlizeQuery.generate(
      query,
      MasterDokumen,
      PluginSqlizeQuery.makeIncludeQueryable(query?.filtered, [])
    )
    const { where, offset, limit } = queryFind

    const { count, rows } = await MasterDokumen.findAndCountAll({
      // include: { model: MasterKategoriDokumen },
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    })

    return {
      data: rows,
      totalRow: count,
      page,
      pageSize,
      pages: Math.ceil(count / pageSize),
    }
  }

  static async findAllSerahTerimaDokumen(serahTerimaType) {
    if (!['alihstatus', 'hibah'].includes(serahTerimaType))
      throw new ResponseError.BadRequest('jenis serah terima tidak valid')

    const masterDokumenSerahTerimas = await MasterDokumenSerahTerima.findAll({
      where: {
        serahTerimaType,
      },
      attributes: [
        'id',
        'MasterDokumenId',
        'serahTerimaType',
        'isRequired',
        'sequence',
      ],
      include: [
        {
          model: MasterDokumen,
          attributes: ['id', 'nama', 'model'],
        },
      ],
      order: [['sequence', 'asc']],
    })

    return masterDokumenSerahTerimas
  }

  static async findById(id) {
    const masterDokumen = await MasterDokumen.findByPk(id)
    if (!masterDokumen)
      throw new ResponseError.NotFound('Dokumen tidak ditemukan')
    return masterDokumen
  }

  static async create({
    nama,
    model,
    jenisData,
    jenisDirektif,
    required,
    type,
    MasterKategoriDokumenId,
    maxSize,
    typeFile,
    ditRusunField,
    jenisBantuan,
    sort,
    formatDokumen,
  }) {
    if (!nama) {
      throw new ResponseError.BadRequest('Nama belum diisi')
    }

    if (!model) {
      throw new ResponseError.BadRequest('Model belum diisi')
    }

    const masterDokumen = await MasterDokumen.create({
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
    })

    if (!masterDokumen) {
      throw new ResponseError.BadRequest('Gagal membuat dokumen')
    }

    return masterDokumen
  }

  static async update(
    id,
    {
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
    }
  ) {
    if (!nama) {
      throw new ResponseError.BadRequest('Nama belum diisi')
    }

    if (!model) {
      throw new ResponseError.BadRequest('Model belum diisi')
    }

    const masterDokumen = await MasterDokumen.findByPk(id)

    if (!masterDokumen) {
      throw new ResponseError.NotFound('Dokumen tidak ditemukan')
    }

    masterDokumen.nama = nama
    masterDokumen.model = model
    masterDokumen.jenisData = jenisData
    masterDokumen.jenisDirektif = jenisDirektif
    masterDokumen.required = required
    masterDokumen.type = type
    masterDokumen.MasterKategoriDokumenId = MasterKategoriDokumenId
    masterDokumen.maxSize = maxSize
    masterDokumen.typeFile = typeFile
    masterDokumen.ditRusunField = ditRusunField
    masterDokumen.jenisBantuan = jenisBantuan
    masterDokumen.sort = sort
    masterDokumen.formatDokumen = formatDokumen

    await masterDokumen.save()

    return masterDokumen
  }

  static async delete(id) {
    const masterDokumen = await MasterDokumen.findByPk(id)
    if (!masterDokumen)
      throw new ResponseError.NotFound('Dokumen tidak ditemukan')
    await masterDokumen.destroy()
  }
}

export default MasterDokumenService
