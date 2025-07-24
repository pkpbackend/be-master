import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import EmonTable from '../../database/models/emontable'
import Provinsi from '../../database/models/provinsi'
import City from '../../database/models/city'
import EmonDetail from '../../database/models/emondetail'
import ResponseError from '../../modules/Error'
import EmonReference from '../../database/models/emonreference'
import sequelize, { Op } from 'sequelize'
import EmonDetailTematikPemanfaatan from '../../database/models/emondetailtematikpemanfaatan'
import _ from 'lodash'
import MasterTematikPemanfaatan from '../../database/models/mastertematikpemanfaatan'
import { removeS3File, uploadFileToS3 } from '../../helpers/s3Helper'
import fs from 'fs'
import excel from 'exceljs'

class PembangunanService {
  static async getPaginate(req) {
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
        EmonTable,
        PluginSqlizeQuery.makeIncludeQueryable(query.filtered, [
          {
            model: Provinsi,
          },
          { model: City },
          { model: EmonDetail },
        ])
      )

    const data = await EmonTable.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })

    const total = await EmonTable.count({
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

  static async getDetail(id) {
    const data = await EmonTable.findOne({
      where: { id },
      include: [
        {
          model: Provinsi,
        },
        { model: City },
        { model: EmonDetail },
      ],
    })
    if (!data) throw new ResponseError.NotFound('Pembangunan tidak ditemukan')
    return data
  }

  static async update(req) {
    const { id } = req.params
    const formData = req.body

    const updateOnlyFormData = _.pick(formData, [
      'prognosisKeuangan',
      'prognosisPresentaseKeuangan',
      'prognosisPresentaseFisik',
      'deviasiPresentaseKeuangan',
      'deviasiPresentaseFisik',
      'rencanaTindakLanjut',
      'jenisKontrak',
      'metodePemilihan',
    ])

    await EmonTable.update(updateOnlyFormData, {
      where: { id },
    })

    return { message: 'successfully update data' }
  }

  static async getEmonFilter() {
    let provinsis = await Provinsi.findAll({
      attributes: ['id', 'kode_rkakl', 'nama'],
      include: [
        {
          attributes: ['id', 'kode_rkakl', 'nama'],
          model: City,
        },
      ],
    })

    let allTahun = await EmonTable.findAll({
      attributes: ['thang'],
      group: ['thang'],
      order: sequelize.literal('thang desc'),
    })
    let tahun = []
    allTahun.forEach((tah) => {
      tahun.push(tah.dataValues.thang)
    })

    let emonreference = await this.getEmonReference()

    return { emonreference, provinsis, tahun }
  }

  static async getEmonReference() {
    let references = await EmonReference.findAll()
    let ref = {}

    for (const reference of references) {
      ref = {
        ...ref,
        [reference.name]: reference.value,
      }
    }

    return { ...ref }
  }

  static async createLokasi(req) {
    const trx = await EmonDetail.sequelize?.transaction()
    try {
      const formData = req.body

      if (!formData.EmonTableId)
        throw new ResponseError.BadRequest('kolom `EmonTableId` harus diisi.')

      // value of tematik ids
      const TematikId = _.get(req.body, 'TematikId', '')

      // reconstruct tematik ids into Array<number>
      let TematikIds = []
      if (typeof TematikId === 'string') {
        TematikIds = TematikId.split(',')
      } else if (Array.isArray(TematikId)) {
        TematikIds = TematikId
      }

      const data = await EmonDetail.create(formData, { transaction: trx })

      // mapping data into new object
      // this is for `EmonDetailTematikPemanfaatan`
      TematikIds = TematikIds.map((val) => ({
        MasterTematikPemanfaatanId: val,
        EmonDetailId: data.id,
      }))

      await EmonDetailTematikPemanfaatan.bulkCreate(TematikIds, {
        transaction: trx,
      })

      await trx.commit()

      return {
        message: 'data successfully created',
        data,
      }
    } catch (err) {
      await trx.rollback()

      const message = err.message || err
      return { message }
    }
  }

  static async getLokasiDetail(id) {
    const data = await EmonDetail.findByPk(id, {
      include: {
        model: MasterTematikPemanfaatan,
        attributes: ['id', 'nama'],
        through: { attributes: [] },
      },
    })

    if (!data)
      throw new ResponseError.NotFound('Pembangunan lokasi tidak ditemukan')

    return { message: 'success', data }
  }

  static async updateLokasi(req) {
    const trx = await EmonDetail.sequelize?.transaction()

    try {
      const { id } = req.params
      const formData = req.body

      if (!formData.EmonTableId)
        throw new ResponseError.BadRequest('kolom `EmonTableId` harus diisi.')

      const TematikId = _.get(req.body, 'TematikId', '')

      // reconstruct tematik ids into Array<number>
      let TematikIds = []
      if (typeof TematikId === 'string') {
        TematikIds = TematikId.split(',')
      } else if (Array.isArray(TematikId)) {
        TematikIds = TematikId
      }

      // delete data not in Tematik ID
      await EmonDetailTematikPemanfaatan.destroy({
        transaction: trx,
        where: {
          EmonDetailId: id,
          MasterTematikPemanfaatanId: { [Op.notIn]: TematikIds },
        },
      })

      // inserting new Tematiks
      for (let i = 0; i < TematikIds.length; i += 1) {
        const tematikId = TematikIds[i]
        const formEmonDetailTematikPemanfaatan = {
          MasterTematikPemanfaatanId: tematikId,
          EmonDetailId: id,
        }

        await EmonDetailTematikPemanfaatan.findOrCreate({
          where: formEmonDetailTematikPemanfaatan,
          transaction: trx,
        })
      }

      await EmonDetail.update(formData, { where: { id }, transaction: trx })

      await trx.commit()

      return { message: 'data successfully updated' }
    } catch (err) {
      await trx.rollback()

      const message = err.message || err
      return { message }
    }
  }

  static async deleteLokasi(req) {
    const { id } = req.params
    const data = await EmonDetail.findByPk(id)

    // Delete Tematiks
    await EmonDetailTematikPemanfaatan.destroy({
      where: { EmonDetailId: id },
    })

    await data.destroy()

    return { message: 'success' }
  }

  static async uploadDokumen(id, { type, dokumen }) {
    if (!type) throw new ResponseError.BadRequest('Type belum diisi')

    const availTypes = ['foto', 'kurvaS', 'video']
    if (!availTypes.includes(type))
      throw new ResponseError.BadRequest('Type tidak valid')

    const data = await EmonDetail.findByPk(id)
    if (!data) throw new ResponseError.NotFound('data not found')

    const dokumenSource = `${dokumen.destination}${dokumen.filename}`
    const s3key = `pembangunan-lokasi/${type}/${dokumen.filename}`

    let s3url

    try {
      s3url = await uploadFileToS3(dokumenSource, s3key)
      fs.unlinkSync(dokumenSource)
    } catch (error) {
      console.log('S3 Error:')
      console.log(error)

      let message = 'Gagal mengupload dokumen'

      if (error) {
        message = typeof error === 'string' ? error : JSON.stringify(error)
      }

      throw new ResponseError.BadRequest(message)
    }

    data[type] = [...(data[type] || []), { file: s3url, description: '' }]

    await data.save()

    return data
  }

  static async exportExcel(req) {
    let { pageSize, page } = req.query
    pageSize = isNaN(pageSize) ? 999999 : parseInt(pageSize)
    page = isNaN(page) ? 1 : parseInt(page)

    let query = {
      ...req.query,
      pageSize,
      page,
    }

    const { includeCount, order, limit, ...queryFind } =
      PluginSqlizeQuery.generate(
        query,
        EmonTable,
        PluginSqlizeQuery.makeIncludeQueryable(query.filtered, [
          {
            model: Provinsi,
          },
          { model: City },
          { model: EmonDetail },
        ])
      )

    const data = await EmonTable.findAll({
      ...queryFind,
      order: order.length ? order : [['createdAt', 'desc']],
      limit,
    })

    const excelCols = [
      { header: 'Tahun Anggaran', key: 'thang', width: 20 },
      { header: 'Kode', key: 'kode', width: 64 },
      { header: 'Paket', key: 'nmpaket', width: 64 },
      { header: 'Kegiatan', key: 'nmgiat', width: 32 },
      { header: 'Output', key: 'nmoutput', width: 64 },
      { header: 'Provinsi', key: 'provinsi', width: 64 },
      { header: 'Kabupaten', key: 'kabupaten', width: 32 },
      { header: 'Satuan Kerja', key: 'nmsatker', width: 32 },
      { header: 'Anggaran', key: 'pagu', width: 24 },
      { header: 'Realisasi', key: 'realisasi', width: 24 },
      { header: 'Latitude', key: 'latitude', width: 24 },
      { header: 'Longitude', key: 'longitude', width: 24 },
    ]

    const workbook = new excel.Workbook()
    const worksheet = workbook.addWorksheet('Pembangunan List')
    worksheet.columns = excelCols

    worksheet.addRows(
      data.map((record) => ({
        ...record.dataValues,
        pagu: parseFloat(record.dataValues.pagu) || null,
        realisasi: parseFloat(record.dataValues.realisasi) || null,
        latitude:
          parseFloat(
            record.dataValues.additional &&
              record.dataValues.additional.latitude
          ) || null,
        longitude:
          parseFloat(
            record.dataValues.additional &&
              record.dataValues.additional.longitude
          ) || null,
      }))
    )

    worksheet.eachRow((col, index) => {
      if (index === 1) col.font = { bold: true }
      col.alignment = { wrapText: true }
    })

    const fileName = `pembangunan-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url

    try {
      const s3key = 'laporan/pembangunan.xlsx'

      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }

  static async exportExcelDetail(id) {
    const data = await EmonTable.findOne({
      where: { id },
      include: [
        {
          model: Provinsi,
        },
        { model: City },
        { model: EmonDetail },
      ],
    })
    if (!data) throw new ResponseError.NotFound('Pembangunan tidak ditemukan')

    const excelCols = [
      { header: 'Kode', key: 'kode', width: 64 },
      { header: 'Paket', key: 'nmpaket', width: 64 },
      { header: 'Satker', key: 'nmsatker', width: 32 },
      { header: 'Tahun Anggaran', key: 'thang', width: 20 },
      { header: 'Kegiatan', key: 'nmgiat', width: 32 },
      { header: 'Output', key: 'nmoutput', width: 64 },
      { header: 'Provinsi', key: 'provinsi', width: 64 },
      { header: 'Kabupaten / Kota', key: 'kabupaten', width: 32 },
      { header: 'Metode Pemilihan', key: 'metodePemilihan', width: 32 },
      { header: 'Jenis Kontrak', key: 'jenisKontrak', width: 32 },
      { header: 'Nilai Kontrak (Rp. 000)', key: 'nilai_kontrak', width: 32 },
      { header: 'Tanggal Mulai Kontrak', key: 'tglmulai', width: 24 },
      { header: 'Tanggal Akhir Kontrak', key: 'tglselesai', width: 24 },
      {
        header: 'Prognasis - Keuangan (Rp. 000)',
        key: 'prognosisKeuangan',
        width: 24,
      },
      {
        header: 'Prognasis - Keuangan (%)',
        key: 'prognosisPresentaseKeuangan',
        key: 24,
      },
      {
        header: 'Prognasis - Fisik (%)',
        key: 'prognosisPresentaseFisik',
        width: 24,
      },
      { header: 'Realisasi - Keuangan (Rp. 000)', key: 'realisasi', width: 24 },
      { header: 'Realisasi - Keuangan (%)', key: 'progreskeu', width: 24 },
      { header: 'Realisasi - Fisik (%)', key: 'progresfis', width: 24 },
      {
        header: 'Deviasi - Keuangan (%)',
        key: 'deviasiPresentaseKeuangan',
        width: 24,
      },
      {
        header: 'Deviasi - Fisik (%)',
        key: 'deviasiPresentaseFisik',
        width: 24,
      },
      {
        header: 'Rencana Tindak Lanjut',
        key: 'rencanaTindakLanjut',
        width: 32,
      },
    ]

    const workbook = new excel.Workbook()
    const worksheet = workbook.addWorksheet('Pembangunan List')
    worksheet.columns = excelCols

    worksheet.addRow(data)

    worksheet.eachRow((col, index) => {
      if (index === 1) col.font = { bold: true }
      col.alignment = { wrapText: true }
    })

    const fileName = `pembangunan-detail-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url

    try {
      const s3key = 'laporan/pembangunan-detail.xlsx'

      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }
}

export default PembangunanService
