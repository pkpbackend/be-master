import fs from 'fs'
import sequelize, { Op } from 'sequelize'
import _, { get, orderBy, toSafeInteger, toString, filter } from 'lodash'
import { endOfDay, format, startOfDay, subDays, id as idLocale } from 'date-fns'
import excel from 'exceljs'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import ResponseError from '../../modules/Error'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import models from '../../database/models'
import { ID_KEGIATAN, KEGIATAN } from '../../constants/Pemanfaatan'
import { keterisianDataPemanfaatan } from '../../constants/ConstKeterisianDataPemanfaatan'
import PusdatinAPIGW from '../../helpers/PusdatinAPIGW'
import axios from 'axios'

/*
MySQL Settings

PERSISTENT:
SET PERSIST sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

TEMPORARY (PER RESTART):
SET GLOBAL sql_mode = '';
*/

const {
  Profile,
  Provinsi,
  City,
  ProKegiatan,
  ProSatker,
  ProBalai,
  Peresmian,
  MasterTematikPemanfaatan,
  PersentaseKeterisianDataPemanfaatan,
  ProfRp3kp,
  ProfPkp,
  ProfP3KECapaian,
  ProfP3KERencanaPenanganan,
} = models

class DashboardService {
  static async findAllMap({
    tahun,
    sampaiTahun,
    ProvinsiId,
    CityId,
    KegiatanId,
    TypeId,
    statusPeresmian,
    statusPenghunian,
    statusOpor,
    statusSerahTerima,
  }) {
    const filterByTahun = this.filterByTahunSelesaiBangun(tahun, sampaiTahun)
    const filterByProvinsiAndCity = this.filterByProvinsiAndCity(
      ProvinsiId,
      CityId
    )
    const filterByKegiatanId = this.filterByKegiatanId(KegiatanId)
    const filterByTypeId = this.filterByTypeId(TypeId)
    const filterByStatusPeresmian =
      this.filterByStatusPeresmian(statusPeresmian)
    const filterByStatusPenghunian =
      this.filterByStatusPenghunian(statusPenghunian)
    const filterByStatusOpor = this.filterByStatusOpor(statusOpor)
    const filterByStatusSerahTerima =
      this.filterByStatusSerahTerima(statusSerahTerima)

    const data = await Profile.findAll({
      attributes: [
        'id',
        'latitude',
        'longitude',
        'id_kegiatan',
        // 'kegiatan',
        'id_provinsi',
        // 'provinsi',
      ],
      include: [
        { model: Provinsi, attributes: ['id', 'nama'] },
        { model: ProKegiatan, attributes: ['id', 'nama'] },
      ],
      where: {
        ...filterByTahun,
        ...filterByProvinsiAndCity,
        ...filterByKegiatanId,
        ...filterByTypeId,
        ...filterByStatusPeresmian,
        ...filterByStatusPenghunian,
        ...filterByStatusOpor,
        ...filterByStatusSerahTerima,
        latitude: {
          [Op.not]: '',
        },
      },
    })

    return data

    // const grouped = _.groupBy(data, 'id_provinsi')

    // let result = []

    // const maxData = 100
    // for (const [key, value] of Object.entries(grouped)) {
    //   let dataCounter = 0
    //   for (const prof of value) {
    //     if (dataCounter < maxData) {
    //       result.push(prof)
    //       dataCounter++
    //     }
    //   }
    // }

    // return result
  }

  static filterByTypeId(TypeId) {
    let TypeIds = []
    let filterByTypeId = {}

    if (typeof TypeId === 'string') {
      TypeIds = TypeId.split(',')
    } else if (Array.isArray(TypeId)) {
      for (const id of TypeId) {
        TypeIds.push(id)
      }
    }

    if (TypeIds.length > 0) {
      filterByTypeId = {
        id_type: {
          [Op.in]: TypeIds,
        },
      }
    }

    return filterByTypeId
  }

  static filterByTahun(tahun, sampaiTahun) {
    /**
     * Filter map by its tahun bangun
     */
    let filterByTahun = {}
    if (tahun && sampaiTahun) {
      filterByTahun = {
        thn_bang: {
          [Op.between]: [tahun, sampaiTahun],
        },
      }
    } else if (tahun) {
      filterByTahun = { thn_bang: tahun }
    }

    return {
      [Op.and]: [
        { ...filterByTahun },
        {
          thn_bang: {
            [Op.not]: null,
          },
        },
      ],
    }
  }

  static filterByTahunSelesaiBangun(tahun, sampaiTahun) {
    /**
     * Filter map by its tahun bangun
     */
    let filterByTahun = {}
    if (tahun && sampaiTahun) {
      filterByTahun = {
        thn_selesaibang: {
          [Op.between]: [tahun, sampaiTahun],
        },
      }
    } else if (tahun) {
      filterByTahun = { thn_selesaibang: tahun }
    }

    return {
      [Op.and]: [
        { ...filterByTahun },
        {
          thn_selesaibang: {
            [Op.not]: null,
          },
        },
      ],
    }
  }

  static filterByStatusPeresmian(status_peresmian) {
    let filterByStatusPeresmian = {}

    if (status_peresmian) {
      filterByStatusPeresmian = { status_peresmian }
    }

    return filterByStatusPeresmian
  }

  static filterByStatusPenghunian(status_penghunian_id) {
    let filterByStatusPenghunian = {}

    if (status_penghunian_id) {
      filterByStatusPenghunian = { status_penghunian_id }
    }

    return filterByStatusPenghunian
  }

  static filterByStatusOpor(status_opor) {
    let filterByStatusOpor = {}

    if (status_opor) {
      filterByStatusOpor = { status_opor }
    }

    return filterByStatusOpor
  }

  static filterByProvinsiAndCity(ProvinsiId, CityId) {
    let filterByProvinsiAndCity = {}

    if (ProvinsiId) {
      filterByProvinsiAndCity = { id_provinsi: ProvinsiId }
    }

    if (CityId) {
      filterByProvinsiAndCity = {
        ...filterByProvinsiAndCity,
        id_kabkota: CityId,
      }
    }

    return filterByProvinsiAndCity
  }

  static filterByKegiatanId(KegiatanId) {
    let KegiatanIds = []
    let filterByKegiatanId = {}

    if (typeof KegiatanId === 'string') {
      KegiatanIds = KegiatanId.split(',')
    }

    if (Array.isArray(KegiatanId)) {
      for (let i = 0; i < KegiatanId.length; i += 1) {
        const id = toString(KegiatanId[i])
        KegiatanIds.push(id)
      }
    }

    if (KegiatanIds.length > 0) {
      filterByKegiatanId = {
        id_kegiatan: {
          [Op.in]: KegiatanIds,
        },
      }
    }

    return filterByKegiatanId
  }

  static filterByTargetHuni(TgtHunianId) {
    let filterByTargetHuni = {}

    if (TgtHunianId) {
      filterByTargetHuni = {
        id_tgt_hunian: TgtHunianId,
      }
    }

    return filterByTargetHuni
  }

  static filterByStatusSerahTerima(stat_srh_trm) {
    let filterByStatusSerahTerima = {}

    if (stat_srh_trm) {
      filterByStatusSerahTerima = { stat_srh_trm }
    }

    return filterByStatusSerahTerima
  }

  static mapPemanfaatanRekap(datas, tahun, sampaiTahun) {
    const parsedData = JSON.parse(JSON.stringify(datas))
    const newData = []

    for (let i = 0; i < parsedData.length; i += 1) {
      const data = parsedData[i]
      const indexKategori = newData.findIndex(
        (e) => e.id_kegiatan === parseInt(data.id_kegiatan)
      )

      if (indexKategori !== -1) {
        const anggaranPk = toSafeInteger(get(data, 'anggaranPk', 0))
        const anggaranPb = toSafeInteger(get(data, 'anggaranPb', 0))
        const unitPk = toSafeInteger(get(data, 'unitPk', 0))
        const unitPb = toSafeInteger(get(data, 'unitPb', 0))
        let anggaran = toSafeInteger(get(data, 'anggaran', 0))
        let unit = toSafeInteger(get(data, 'unit', 0))

        if (parseInt(data.id_kegiatan) === ID_KEGIATAN.RUSWA) {
          unit = unitPk + unitPb
          anggaran = anggaranPk + anggaranPb
        }

        newData[indexKategori].data = [
          ...newData[indexKategori].data,
          {
            tahun: toSafeInteger(get(data, 'thn_bang')),
            unit,
            tower: toSafeInteger(get(data, 'tower', 0)),
            anggaran,
            unitPk: toSafeInteger(get(data, 'unitPk', 0)),
            unitPb: toSafeInteger(get(data, 'unitPb', 0)),
            anggaranPk,
            anggaranPb,
          },
        ]
      } else {
        const objData = {
          id_kegiatan: parseInt(get(data, 'id_kegiatan', 0)),
          // kegiatan: toString(get(data, 'kegiatan', '')),
          kegiatan: KEGIATAN[parseInt(get(data, 'id_kegiatan', 0))],
          data: [
            {
              tahun: toSafeInteger(get(data, 'thn_bang')),
              unit: toSafeInteger(get(data, 'unit', 0)),
              tower: toSafeInteger(get(data, 'tower', 0)),
              anggaran: toSafeInteger(get(data, 'anggaran', 0)),
              unitPk: toSafeInteger(get(data, 'unitPk', 0)),
              unitPb: toSafeInteger(get(data, 'unitPb', 0)),
              anggaranPk: toSafeInteger(get(data, 'anggaranPk', 0)),
              anggaranPb: toSafeInteger(get(data, 'anggaranPb', 0)),
            },
          ],
        }

        newData.push(objData)
      }
    }

    // count total
    const dataTotal = {
      id_kegiatan: 999,
      kegiatan: 'total',
      data: [],
    }

    // total data
    for (let i = 0; i < newData.length; i += 1) {
      const data = newData[i]
      for (let j = 0; j < data.data.length; j += 1) {
        const subData = { ...data.data[j] }
        const findDataTahun = dataTotal.data.findIndex(
          (e) => e.tahun === subData.tahun
        )

        if (findDataTahun !== -1) {
          dataTotal.data[findDataTahun].anggaran += subData.anggaran
          dataTotal.data[findDataTahun].anggaranPb += subData.anggaranPb
          dataTotal.data[findDataTahun].anggaranPk += subData.anggaranPk
          dataTotal.data[findDataTahun].tower += subData.tower
          dataTotal.data[findDataTahun].unit += subData.unit
          dataTotal.data[findDataTahun].unitPb += subData.unitPb
          dataTotal.data[findDataTahun].unitPk += subData.unitPk

          // eslint-disable-next-line no-continue
          continue
        }

        dataTotal.data.push(subData)
      }
    }

    newData.push(dataTotal)

    // Add kegiatan is kosong
    const kegiatanKeys = Object.keys(ID_KEGIATAN)
    for (let i = 0; i < kegiatanKeys.length; i += 1) {
      const key = kegiatanKeys[i]
      const idKegiatan = ID_KEGIATAN[key]
      const findData = newData.findIndex((e) => e.id_kegiatan === idKegiatan)

      if (findData === -1) {
        newData.push({
          id_kegiatan: idKegiatan,
          data: [],
          kegiatan: KEGIATAN[idKegiatan],
        })
      }
    }

    // jika filter tahun tidak ada.
    // maka return hasil mapping data
    if (sampaiTahun && tahun) {
      // jika ada, maka set default data
      let thn = tahun
      let sampaiThn = sampaiTahun

      if (typeof thn === 'string') {
        thn = parseInt(thn)
      }

      if (typeof sampaiThn === 'string') {
        sampaiThn = parseInt(sampaiThn)
      }

      for (let i = 0; i < newData.length; i += 1) {
        const data = newData[i]
        for (let j = thn; j <= sampaiThn; j += 1) {
          const isHaveDataTahun = data.data.findIndex((e) => e.tahun === j)
          if (isHaveDataTahun === -1) {
            data.data.push({
              tahun: j,
              unit: 0,
              tower: 0,
              anggaran: 0,
              unitPk: 0,
              unitPb: 0,
              anggaranPk: 0,
              anggaranPb: 0,
            })
          }
        }
      }
    }

    // sorting sub data by tahun
    for (let i = 0; i < newData.length; i += 1) {
      newData[i].data = newData[i].data.sort((a, b) => a.tahun - b.tahun)
    }

    return newData
  }

  static mapPemanfaatanRekapPerTahun(datas) {
    const parsedData = JSON.parse(JSON.stringify(datas))
    const newData = []

    for (let i = 0; i < parsedData.length; i += 1) {
      const data = parsedData[i]
      const indexThn = newData.findIndex(
        (e) => e.tahun === parseInt(data.thn_bang)
      )

      if (indexThn !== -1) {
        newData[indexThn].data = [
          ...newData[indexThn].data,
          {
            id_kabkota: toSafeInteger(get(data, 'City.id', 0)),
            kabkota: toString(get(data, 'City.nama', '')),
            unitRuk: toSafeInteger(get(data, 'unitRuk', 0)),
            towerRuk: toSafeInteger(get(data, 'towerRuk', 0)),
            anggaranRuk: toSafeInteger(get(data, 'anggaranRuk', 0)),
            unitRusus: toSafeInteger(get(data, 'unitRusus', 0)),
            towerRusus: toSafeInteger(get(data, 'towerRusus', 0)),
            anggaranRusus: toSafeInteger(get(data, 'anggaranRusus', 0)),
            unitRusun: toSafeInteger(get(data, 'unitRusun', 0)),
            towerRusun: toSafeInteger(get(data, 'towerRusun', 0)),
            anggaranRusun: toSafeInteger(get(data, 'anggaranRusun', 0)),
            unitRuswaPk: toSafeInteger(get(data, 'unitRuswaPk', 0)),
            towerRuswaPk: toSafeInteger(get(data, 'towerRuswaPk', 0)),
            anggaranRuswaPk: toSafeInteger(get(data, 'anggaranRuswaPk', 0)),
            unitRuswaPb: toSafeInteger(get(data, 'unitRuswaPb', 0)),
            towerRuswaPb: toSafeInteger(get(data, 'towerRuswaPb', 0)),
            anggaranRuswaPb: toSafeInteger(get(data, 'anggaranRuswaPb', 0)),
          },
        ]
      } else {
        const resData = {
          tahun: parseInt(get(data, 'thn_bang', null)),
          // id_provinsi: get(data, 'Provinsi.id', null),
          id_provinsi: get(data, 'id_kabkota', null),
          provinsi: get(data, 'Provinsi.nama', null),
          data: [
            {
              id_kabkota: toSafeInteger(get(data, 'City.id', 0)),
              kabkota: toString(get(data, 'City.nama', '')),
              unitRuk: toSafeInteger(get(data, 'unitRuk', 0)),
              towerRuk: toSafeInteger(get(data, 'towerRuk', 0)),
              anggaranRuk: toSafeInteger(get(data, 'anggaranRuk', 0)),
              unitRusus: toSafeInteger(get(data, 'unitRusus', 0)),
              towerRusus: toSafeInteger(get(data, 'towerRusus', 0)),
              anggaranRusus: toSafeInteger(get(data, 'anggaranRusus', 0)),
              unitRusun: toSafeInteger(get(data, 'unitRusun', 0)),
              towerRusun: toSafeInteger(get(data, 'towerRusun', 0)),
              anggaranRusun: toSafeInteger(get(data, 'anggaranRusun', 0)),
              unitRuswaPk: toSafeInteger(get(data, 'unitRuswaPk', 0)),
              towerRuswaPk: toSafeInteger(get(data, 'towerRuswaPk', 0)),
              anggaranRuswaPk: toSafeInteger(get(data, 'anggaranRuswaPk', 0)),
              unitRuswaPb: toSafeInteger(get(data, 'unitRuswaPb', 0)),
              towerRuswaPb: toSafeInteger(get(data, 'towerRuswaPb', 0)),
              anggaranRuswaPb: toSafeInteger(get(data, 'anggaranRuswaPb', 0)),
            },
          ],
        }

        newData.push(resData)
      }
    }

    return newData
  }

  static async findSummary(query) {
    const {
      tahun,
      sampaiTahun,
      statusPeresmian,
      statusPenghunian,
      statusOpor,
      ProvinsiId,
      CityId,
    } = query
    const filterByTahun = this.filterByTahunSelesaiBangun(tahun, sampaiTahun)
    const filterByStatusPeresmian =
      this.filterByStatusPeresmian(statusPeresmian)
    const filterByStatusPenghunian =
      this.filterByStatusPenghunian(statusPenghunian)
    const filterByStatusOpor = this.filterByStatusOpor(statusOpor)
    const filterByProvinsiAndCity = this.filterByProvinsiAndCity(
      ProvinsiId,
      CityId
    )

    const kegiatanData = await Profile.findAll({
      group: ['id_kegiatan'],
      where: {
        ...filterByTahun,
        ...filterByProvinsiAndCity,
        ...filterByStatusPeresmian,
        ...filterByStatusPenghunian,
        ...filterByStatusOpor,
        kegiatan: { [Op.not]: null },
        [Op.or]: [
          { id_kegiatan: { [Op.not]: ID_KEGIATAN.RUSWA } },
          { kegiatan: { [Op.not]: 'Pemberdayaan Perumahan Swadaya' } },
        ],
      },
      include: [{ model: ProKegiatan, attributes: ['id', 'nama'] }],
      attributes: [
        'id_kegiatan',
        [sequelize.fn('SUM', sequelize.col('jml_unit')), 'unit'],
        [sequelize.fn('SUM', sequelize.col('jml_unit_huni')), 'terhuni'],
        [sequelize.fn('SUM', sequelize.col('tower')), 'tower'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
              CASE
                WHEN stat_srh_trm = 1
              THEN jml_unit
              ELSE 0 END`)
          ),
          'serah_terima_asset',
        ],
        [sequelize.fn('SUM', sequelize.col('tot_biaya')), 'anggaran'],
      ],
    })

    const dataKegiatanRuswa = await Profile.findAll({
      group: ['id_kegiatan'],
      where: {
        ...filterByTahun,
        ...filterByProvinsiAndCity,
        [Op.or]: {
          id_kegiatan: ID_KEGIATAN.RUSWA,
          kegiatan: 'Pemberdayaan Perumahan Swadaya',
        },
      },
      include: [{ model: ProKegiatan, attributes: ['id', 'nama'] }],
      attributes: [
        'id_kegiatan',
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Peningkatan Kualitas"
          THEN jml_unit ELSE 0 END`)
          ),
          'unitPk',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Pembangunan Baru"
          THEN jml_unit ELSE 0 END`)
          ),
          'unitPb',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Peningkatan Kualitas"
          THEN tot_biaya ELSE 0 END`)
          ),
          'anggaranPk',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Pembangunan Baru"
          THEN tot_biaya ELSE 0 END`)
          ),
          'anggaranPb',
        ],
      ],
    })

    return [...kegiatanData, ...dataKegiatanRuswa]
  }

  static async findRekap(query) {
    const {
      tahun,
      sampaiTahun,
      KegiatanId,
      ProvinsiId,
      CityId,
      TgtHunianId,
      TypeId,
      statusPeresmian,
      statusPenghunian,
      statusOpor,
      statusSerahTerima,
    } = query

    // filter by query
    const filterByKegiatanId = this.filterByKegiatanId(KegiatanId)
    const filterByTypeId = this.filterByTypeId(TypeId)
    const filterByProvinsiAndCity = this.filterByProvinsiAndCity(
      ProvinsiId,
      CityId
    )
    const filterByTahun = this.filterByTahun(tahun, sampaiTahun)
    const filterByTargetHuni = this.filterByTargetHuni(TgtHunianId)
    const filterByStatusPeresmian =
      this.filterByStatusPeresmian(statusPeresmian)
    const filterByStatusPenghunian =
      this.filterByStatusPenghunian(statusPenghunian)
    const filterByStatusOpor = this.filterByStatusOpor(statusOpor)
    const filterByStatusSerahTerima =
      this.filterByStatusSerahTerima(statusSerahTerima)

    const { order, ...queryFind } = PluginSqlizeQuery.generate(query, Profile)

    queryFind.where = {
      ...queryFind.where,
      ...filterByTahun,
      ...filterByKegiatanId,
      ...filterByProvinsiAndCity,
      ...filterByTargetHuni,
      ...filterByTypeId,
      ...filterByStatusPeresmian,
      ...filterByStatusPenghunian,
      ...filterByStatusOpor,
      ...filterByStatusSerahTerima,
    }

    const data = await Profile.findAll({
      include: queryFind.include,
      where: queryFind.where,
      order: order.length ? order : [['createdAt', 'desc']],
      group: ['thn_bang', 'id_kegiatan'],
      attributes: [
        'thn_bang',
        'id_kegiatan',
        'kegiatan',
        [sequelize.fn('SUM', sequelize.col('jml_unit')), 'unit'],
        [sequelize.fn('SUM', sequelize.col('tower')), 'tower'],
        [sequelize.fn('SUM', sequelize.col('tot_biaya')), 'anggaran'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Peningkatan Kualitas"
          THEN jml_unit ELSE 0 END`)
          ),
          'unitPk',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Pembangunan Baru"
          THEN jml_unit ELSE 0 END`)
          ),
          'unitPb',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Peningkatan Kualitas"
          THEN tot_biaya ELSE 0 END`)
          ),
          'anggaranPk',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`
          CASE WHEN output = "Pembangunan Baru"
          THEN tot_biaya ELSE 0 END`)
          ),
          'anggaranPb',
        ],
      ],
    })
    const mappedData = this.mapPemanfaatanRekap(data, tahun, sampaiTahun)

    return mappedData
  }

  static async exportExcelRekap(query) {
    const { tahun, sampaiTahun } = query
    if (!tahun || !sampaiTahun)
      throw new ResponseError.BadRequest('Tahun belum dilengkapi')

    const templateName = 'rekap'
    const templatePath = `./xlsx/${templateName}.xlsx`
    const keyName = `${templateName}-${tahun}-${sampaiTahun}`

    const data = await this.findRekap(query)
    if (!data.length === 0)
      throw new ResponseError.BadRequest(
        `Data tahun ${tahun} s/d ${sampaiTahun} belum tersedia`
      )

    const workbook = new excel.Workbook()
    await workbook.xlsx.readFile(templatePath)
    const worksheet = workbook.getWorksheet(1)

    let i = 2

    const headRow = worksheet.getRow(1)

    for (const record of data) {
      i++

      const kegiatan = record?.kegiatan

      const row = worksheet.getRow(i)

      row.getCell(1).value = `${i}.`
      row.getCell(2).value = kegiatan

      let vIndex = 2

      for (const calc of record.data) {
        const tahun = calc.tahun
        const unitTower = `${calc.unit} | ${calc.tower}`
        const anggaran = calc.anggaran

        vIndex++
        headRow.getCell(vIndex).value = tahun
        row.getCell(vIndex).value = unitTower
        vIndex++
        row.getCell(vIndex).value = anggaran
      }

      row.commit()
    }

    headRow.commit()

    const fileName = `${keyName}-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = `laporan/${keyName}.xlsx`

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }

  static async findRekapPerTahun(query) {
    const {
      tahun,
      sampaiTahun,
      KegiatanId,
      ProvinsiId,
      CityId,
      TgtHunianId,
      TypeId,
      statusPeresmian,
      statusPenghunian,
      statusOpor,
      statusSerahTerima,
    } = query

    // Filter query

    const filterByKegiatanId = this.filterByKegiatanId(KegiatanId)
    const filterByProvinsiAndCity = this.filterByProvinsiAndCity(
      ProvinsiId,
      CityId
    )
    const filterByTypeId = this.filterByTypeId(TypeId)
    const filterByTahun = this.filterByTahunSelesaiBangun(tahun, sampaiTahun)
    const filterByTargetHuni = this.filterByTargetHuni(TgtHunianId)
    const filterByStatusPeresmian =
      this.filterByStatusPeresmian(statusPeresmian)
    const filterByStatusPenghunian =
      this.filterByStatusPenghunian(statusPenghunian)
    const filterByStatusOpor = this.filterByStatusOpor(statusOpor)
    const filterByStatusSerahTerima =
      this.filterByStatusSerahTerima(statusSerahTerima)

    const { order, ...queryFind } = PluginSqlizeQuery.generate(query, Profile, [
      { model: Provinsi, attributes: ['id', 'nama'] },
      { model: City, attributes: ['id', 'nama'] },
    ])

    queryFind.where = {
      ...queryFind.where,
      ...filterByTahun,
      ...filterByKegiatanId,
      ...filterByProvinsiAndCity,
      ...filterByTargetHuni,
      ...filterByTypeId,
      ...filterByStatusPeresmian,
      ...filterByStatusPenghunian,
      ...filterByStatusOpor,
      ...filterByStatusSerahTerima,
    }

    const kegiatanKeys = Object.keys(ID_KEGIATAN)
    // const attributes: FindAttributeOptions = []
    const attributes = []

    for (let i = 0; i < kegiatanKeys.length; i += 1) {
      const key = kegiatanKeys[i]
      const ID_KEGIATAN_VALUE = ID_KEGIATAN[key]
      const fieldName = []

      switch (ID_KEGIATAN_VALUE) {
        case ID_KEGIATAN.RUK:
          fieldName.push('unitRuk', 'towerRuk', 'anggaranRuk')
          break

        case ID_KEGIATAN.RUSUN:
          fieldName.push('unitRusun', 'towerRusun', 'anggaranRusun')
          break

        case ID_KEGIATAN.RUSUS:
          fieldName.push('unitRusus', 'towerRusus', 'anggaranRusus')
          break

        default:
      }

      if (ID_KEGIATAN.RUSWA !== ID_KEGIATAN_VALUE) {
        const [unit, tower, anggaran] = fieldName
        attributes.push(
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} THEN jml_unit ELSE 0 END`)
            ),
            unit,
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} THEN tower ELSE 0 END`)
            ),
            tower,
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} THEN tot_biaya ELSE 0 END`)
            ),
            anggaran,
          ]
        )
      } else {
        attributes.push(
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Peningkatan Kualitas" THEN jml_unit ELSE 0 END`)
            ),
            'unitRuswaPk',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Peningkatan Kualitas" THEN tower ELSE 0 END`)
            ),
            'towerRuswaPk',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Peningkatan Kualitas" THEN tot_biaya ELSE 0 END`)
            ),
            'anggaranRuswaPk',
          ]
        )
        attributes.push(
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Pembangunan Baru" THEN jml_unit ELSE 0 END`)
            ),
            'unitRuswaPb',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Pembangunan Baru" THEN tot_biaya ELSE 0 END`)
            ),
            'anggaranRuswaPb',
          ],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal(`
              CASE WHEN id_kegiatan = ${ID_KEGIATAN_VALUE} AND output = "Pembangunan Baru" THEN tower ELSE 0 END`)
            ),
            'towerRuswaPb',
          ]
        )
      }
    }

    const data = await Profile.findAll({
      // include: queryFind.include,
      include: [{ model: City, attributes: ['id', 'nama'] }],
      where: queryFind.where,
      group: [
        'id_kabkota',
        'thn_bang',
        // New
        // 'id_kegiatan',
        // 'id_type',
      ],
      order: order.length ? order : ['thn_bang', 'id_kabkota'],
      attributes: [
        ...attributes,
        // 'id_kegiatan',
        // 'kegiatan',
        'thn_bang',
        // 'id_type',
        // 'type',
      ],
    })
    const mappedData = this.mapPemanfaatanRekapPerTahun(data)

    return mappedData
  }

  static async exportExcelRekapPerTahun(query) {
    const { tahun } = query
    if (!tahun) throw new ResponseError.BadRequest('Tahun belum dilengkapi')

    const newQuery = {
      ...query,
      sampaiTahun: tahun + 1,
    }

    const templateName = 'rekap-per-tahun'
    const templatePath = `./xlsx/${templateName}.xlsx`
    const keyName = `${templateName}-${tahun}`

    const dataRekapPerTahun = await this.findRekapPerTahun(newQuery)
    if (!dataRekapPerTahun.length === 0)
      throw new ResponseError.BadRequest(`Data tahun ${tahun} belum tersedia`)
    const data = dataRekapPerTahun[0].data

    const workbook = new excel.Workbook()
    await workbook.xlsx.readFile(templatePath)
    const worksheet = workbook.getWorksheet(1)

    let i = 2

    for (const record of data) {
      i++

      const kabkota = record?.kabkota

      const unitRusun = record?.unitRusun || 0
      const towerRusun = record?.towerRusun || 0
      const unitTowerRusun = `${unitRusun} | ${towerRusun}`
      const anggaranRusun = record?.anggaranRusun || 0

      const unitRusus = record?.unitRusus || 0
      const towerRusus = record?.towerRusus || 0
      const unitTowerRusus = `${unitRusus} | ${towerRusus}`
      const anggaranRusus = record?.anggaranRusus || 0

      const unitRuswaPk = record?.unitRuswaPk || 0
      const towerRuswaPk = record?.towerRuswaPk || 0
      const unitTowerRuswaPk = `${unitRuswaPk} | ${towerRuswaPk}`
      const anggaranRuswaPk = record?.anggaranRuswaPk || 0

      const unitRuswaPb = record?.unitRuswaPb || 0
      const towerRuswaPb = record?.towerRuswaPb || 0
      const unitTowerRuswaPb = `${unitRuswaPb} | ${towerRuswaPb}`
      const anggaranRuswaPb = record?.anggaranRuswaPb || 0

      const unitRuswa = unitRuswaPk + unitRuswaPb
      const towerRuswa = towerRuswaPk + towerRuswaPb
      const unitTowerRuswa = `${unitRuswa} | ${towerRuswa}`
      const anggaranRuswa = anggaranRuswaPk + anggaranRuswaPb

      const unitRuk = record?.unitRuk || 0
      const towerRuk = record?.towerRuk || 0
      const unitTowerRuk = `${unitRuk} | ${towerRuk}`
      const anggaranRuk = record?.anggaranRuk || 0

      const totalUnit = unitRusun + unitRusus + unitRuswa + unitRuk
      const totalTower = towerRusun + towerRusus + towerRuswa + towerRuk
      const totalUnitTower = `${totalUnit} | ${totalTower}`
      const totalAnggaran =
        anggaranRusun + anggaranRusus + anggaranRuswa + anggaranRuk

      const row = worksheet.getRow(i)

      row.getCell(1).value = `${i}.`
      row.getCell(2).value = kabkota

      row.getCell(3).value = unitTowerRusun
      row.getCell(4).value = anggaranRusun

      row.getCell(5).value = unitTowerRusus
      row.getCell(6).value = anggaranRusus

      row.getCell(7).value = unitTowerRuswa
      row.getCell(8).value = anggaranRuswa

      row.getCell(9).value = unitTowerRuk
      row.getCell(10).value = anggaranRuk

      row.getCell(11).value = totalUnitTower
      row.getCell(12).value = totalAnggaran

      row.commit()
    }

    const fileName = `${keyName}-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = `laporan/${keyName}.xlsx`

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }

  static async findRekapDetail({ TypeIds, CityId, tahun }) {
    if (!TypeIds && !CityId && !tahun) {
      throw new ResponseError.BadRequest('Lengkapi setidaknya 1 filter')
    }

    let criteria = {}

    if (CityId) {
      criteria.id_kabkota = CityId
    }

    if (TypeIds) {
      let newTypeIds = TypeIds

      if (typeof TypeIds === 'string') {
        newTypeIds = TypeIds.split(',')
      }

      criteria.id_type = {
        [Op.in]: newTypeIds,
      }
    }

    if (tahun) {
      criteria.thn_bang = tahun
    }

    var data = await Profile.findAll({
      where: criteria,
    })

    return data
  }

  static async findRekapPerProvinsiDanKategori(query) {
    const today = new Date()
    const {
      tahun = today.getFullYear() - 1,
      sampaiTahun = today.getFullYear(),
      kategori,
      PenerimaManfaatId,
      TematikIds,
    } = query

    const profileAttributes = ['id_type']
    const hasPenerimaManfaatId = parseFloat(PenerimaManfaatId) > 0

    let filterProfileQueries = {
      ...(hasPenerimaManfaatId ? { id_tgt_hunian: PenerimaManfaatId } : {}),
      thn_bang: {
        [Op.between]: [tahun, sampaiTahun],
      },
    }

    const listTematikIds = (TematikIds && TematikIds.split(',')) || []
    const tematikQueries =
      listTematikIds.length > 0 ? { id: { [Op.in]: listTematikIds } } : {}

    switch (kategori) {
      case 'tower':
        profileAttributes.push([
          sequelize.fn('sum', sequelize.col('Profiles.tower')),
          'total',
        ])
        break

      case 'terhuni':
        profileAttributes.push([
          sequelize.fn('sum', sequelize.col('Profiles.jml_unit_huni')),
          'total',
        ])
        break

      case 'serahTerimaAset':
        profileAttributes.push([
          sequelize.fn('count', sequelize.col('Profiles.id')),
          'total',
        ])

        filterProfileQueries = {
          ...filterProfileQueries,
          stat_srh_trm: {
            [Op.in]: [
              true,
              1,
              'Dihapus Dari Neraca (Hibah)',
              'Sudah dihapus',
              'Telah diterbitkan SK Penghapusan & BAST',
            ],
          },
        }
        break

      case 'anggaran':
        profileAttributes.push([
          sequelize.fn('sum', sequelize.col('Profiles.tot_biaya')),
          'total',
        ])
        break

      // Unit
      default:
        profileAttributes.push([
          sequelize.fn('sum', sequelize.col('Profiles.jml_unit')),
          'total',
        ])
        break
    }

    const rekap = await Provinsi.findAll({
      include: [
        {
          model: Profile,
          include: [
            {
              model: MasterTematikPemanfaatan,
              attributes: ['id', 'nama'],
              // where: tematikQueries,
            },
          ],
          attributes: profileAttributes,
          where: filterProfileQueries,
          required: true,
        },
      ],
      attributes: ['id', 'nama'],
      group: ['id', 'Profiles.id_type'],
      order: [['id', 'ASC']],
    })

    return {
      kategori,
      data: rekap,
      query,
    }
  }

  static async findRekapPengisianData(query) {
    const { tahun, sampaiTahun } = query

    const { ...queryFind } = PluginSqlizeQuery.generate(query, Profile, [])
    const filterByTahun = this.filterByTahun(tahun, sampaiTahun)

    queryFind.where = {
      ...queryFind.where,
      ...filterByTahun,
    }

    const data = await Profile.findAll({
      where: queryFind.where,
      group: ['id_provinsi', 'dataKegiatan'],
      raw: true,
      include: [{ model: Provinsi, attributes: ['id', 'nama'] }],
      attributes: [
        [
          sequelize.literal(`CASE WHEN id_type = 3 AND id_output = 3 THEN 'swadayaPk'
          WHEN id_type = 3 AND id_output = 2 THEN 'swadayaPb'
          WHEN id_type = 3 AND id_output IS NULL THEN 'swadaya'
          WHEN id_type = 1 THEN 'rusun'
          WHEN id_type = 2 THEN 'rusus'
          WHEN id_type = 4 THEN 'ruk' END`),
          'dataKegiatan',
        ],
        [sequelize.fn('SUM', sequelize.col('jml_unit')), 'unit'],
        [sequelize.fn('COUNT', 'Profile.id'), 'data'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN Profile.longitude IS NOT NULL OR Profile.longitude != '' THEN 1 ELSE 0 END`
            )
          ),
          'koordinatData',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN foto IS NOT NULL AND foto != '' AND foto != '[]' THEN 1 ELSE 0 END`
            )
          ),
          'fotoData',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN video IS NOT NULL AND video != '' AND video != '[]' THEN 1 ELSE 0 END`
            )
          ),
          'videoData',
        ],
        [sequelize.fn('SUM', sequelize.col('jml_unit_huni')), 'penghunianUnit'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`CASE WHEN status_opor = 1 THEN 1 ELSE 0 END`)
          ),
          'opor',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`CASE WHEN stat_srh_trm = 1 THEN 1 ELSE 0 END`)
          ),
          'sudahSerahTerima',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(`CASE WHEN stat_srh_trm != 1 THEN 1 ELSE 0 END`)
          ),
          'belumSerahTerima',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN status_peresmian != 2 AND status_peresmian != 3 THEN 1 ELSE 0 END`
            )
          ),
          'statusPeresmianBelum',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN status_peresmian = 2 THEN 1 ELSE 0 END`
            )
          ),
          'statusPeresmianDiusulkan',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              `CASE WHEN status_peresmian = 3 THEN 1 ELSE 0 END`
            )
          ),
          'statusPeresmianSudah',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('CASE WHEN status_opor IS NULL THEN 1 ELSE 0 END')
          ),
          'oporTidakAda',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('CASE WHEN status_opor = 0 THEN 1 ELSE 0 END')
          ),
          'oporBelumDiusulkan',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('CASE WHEN status_opor = 1 THEN 1 ELSE 0 END')
          ),
          'oporDiusulkan',
        ],
        /* Kondisi Bangunan */
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              'CASE WHEN KondisiBangunanId = 1 THEN 1 ELSE 0 END'
            )
          ),
          'kondisibangunanBaik',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              'CASE WHEN KondisiBangunanId = 2 THEN 1 ELSE 0 END'
            )
          ),
          'kondisibangunanRusakRingan',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              'CASE WHEN KondisiBangunanId = 3 THEN 1 ELSE 0 END'
            )
          ),
          'kondisibangunanRusakSedang',
        ],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal(
              'CASE WHEN KondisiBangunanId = 4 THEN 1 ELSE 0 END'
            )
          ),
          'kondisibangunanRusakBerat',
        ],
        [sequelize.fn('MAX', sequelize.col('Profile.updatedAt')), 'updatedAt'],
      ],
    })
    // })) as (ProfileInstance & { Provinsi: object })[]

    // // grouping data
    const newData = _(data)
      // @ts-expect-error
      .groupBy((x) => x['Provinsi.nama'])
      .map((data, provinsi) => {
        // const prov = !isEmpty(data) ? data[0].provinsi : ''
        return {
          provinsi,
          data: orderBy(data, 'dataKegiatan', 'asc'),
        }
      })
      .value()

    return newData
  }

  static async exportExcelRekapPengisianData(query) {
    const { tahun, sampaiTahun } = query

    if (!tahun) throw new ResponseError.BadRequest('Tahun belum dilengkapi')
    if (!sampaiTahun)
      throw new ResponseError.BadRequest('Tahun belum dilengkapi')

    const templateName = 'rekap-pengisian-data'
    const templatePath = `./xlsx/${templateName}.xlsx`
    const keyName = `${templateName}-${tahun}-${sampaiTahun}`

    const data = await this.findRekapPengisianData(query)

    const workbook = new excel.Workbook()
    await workbook.xlsx.readFile(templatePath)
    const worksheet = workbook.getWorksheet(1)

    let i = 3

    let totalUnit = 0
    let totalData = 0
    let totalKoordinatData = 0
    let totalFotoData = 0
    let totalVideoData = 0
    let totalPenghunianUnit = 0
    let totalBelumSerahTerima = 0
    let totalSudahSerahTerima = 0
    let totalKondisibangunanBaik = 0
    let totalKondisibangunanRusakRingan = 0
    let totalKondisibangunanRusakSedang = 0
    let totalKondisibangunanRusakBerat = 0
    let totalStatusPeresmianBelum = 0
    let totalStatusPeresmianDiusulkan = 0
    let totalStatusPeresmianSudah = 0
    let totalOporBelumDiusulkan = 0
    let totalOporDiusulkan = 0
    let totalOpor = 0

    for (const rootRecord of data) {
      i++

      const provinsi = rootRecord?.provinsi
      const records = rootRecord?.data

      let unit = 0
      let data = 0
      let koordinatData = 0
      let fotoData = 0
      let videoData = 0
      let penghunianUnit = 0
      let belumSerahTerima = 0
      let sudahSerahTerima = 0
      let kondisibangunanBaik = 0
      let kondisibangunanRusakRingan = 0
      let kondisibangunanRusakSedang = 0
      let kondisibangunanRusakBerat = 0
      let statusPeresmianBelum = 0
      let statusPeresmianDiusulkan = 0
      let statusPeresmianSudah = 0
      let oporBelumDiusulkan = 0
      let oporDiusulkan = 0
      let opor = 0
      let waktuUpdate = '-'

      for (const record of records) {
        unit += parseInt(record?.unit)
        data += parseInt(record?.data)
        koordinatData += parseInt(
          record.koordinatData ? record.koordinatData : 0
        )
        fotoData += parseInt(record.fotoData ? record.fotoData : 0)
        videoData += parseInt(record.videoData ? record.videoData : 0)
        penghunianUnit += parseInt(
          record.penghunianUnit ? record.penghunianUnit : 0
        )
        belumSerahTerima += parseInt(
          record.belumSerahTerima ? record.belumSerahTerima : 0
        )
        sudahSerahTerima += parseInt(
          record.sudahSerahTerima ? record.sudahSerahTerima : 0
        )
        kondisibangunanBaik += parseInt(
          record.kondisibangunanBaik ? record.kondisibangunanBaik : 0
        )
        kondisibangunanRusakRingan += parseInt(
          record.kondisibangunanRusakRingan
            ? record.kondisibangunanRusakRingan
            : 0
        )
        kondisibangunanRusakSedang += parseInt(
          record.kondisibangunanRusakSedang
            ? record.kondisibangunanRusakSedang
            : 0
        )
        kondisibangunanRusakBerat += parseInt(
          record.kondisibangunanRusakBerat
            ? record.kondisibangunanRusakBerat
            : 0
        )
        statusPeresmianBelum += parseInt(
          record.statusPeresmianBelum ? record.statusPeresmianBelum : 0
        )
        statusPeresmianDiusulkan += parseInt(
          record.statusPeresmianDiusulkan ? record.statusPeresmianDiusulkan : 0
        )
        statusPeresmianSudah += parseInt(
          record.statusPeresmianSudah ? record.statusPeresmianSudah : 0
        )
        oporBelumDiusulkan += parseInt(
          record.oporBelumDiusulkan ? record.oporBelumDiusulkan : 0
        )
        oporDiusulkan += parseInt(
          record.oporDiusulkan ? record.oporDiusulkan : 0
        )
        opor += parseInt(record.opor ? record.opor : 0)

        if (record.updatedAt) {
          // const updatedAt = new Date(record.updatedAt)
          // waktuUpdate = `'${updatedAt.getFullYear()}/${updatedAt.getMonth() + 1}/${updatedAt.getDate()}`
          waktuUpdate = record.updatedAt
        }
      }

      totalUnit += unit
      totalData += data
      totalKoordinatData += koordinatData
      totalFotoData += fotoData
      totalVideoData += videoData
      totalVideoData += penghunianUnit
      totalBelumSerahTerima += belumSerahTerima
      totalSudahSerahTerima += sudahSerahTerima
      totalKondisibangunanBaik += kondisibangunanBaik
      totalKondisibangunanRusakRingan += kondisibangunanRusakRingan
      totalKondisibangunanRusakSedang += kondisibangunanRusakSedang
      totalKondisibangunanRusakBerat += kondisibangunanRusakBerat
      totalStatusPeresmianBelum += statusPeresmianBelum
      totalStatusPeresmianDiusulkan += statusPeresmianDiusulkan
      totalStatusPeresmianSudah += statusPeresmianSudah
      totalOporBelumDiusulkan += oporBelumDiusulkan
      totalOporDiusulkan += oporDiusulkan
      totalOpor += opor

      const row = worksheet.getRow(i)

      row.getCell(1).value = `${i}.`
      row.getCell(2).value = provinsi
      row.getCell(3).value = 'SEMUA KEGIATAN'
      row.getCell(4).value = unit
      row.getCell(5).value = data
      row.getCell(6).value = koordinatData
      row.getCell(7).value = fotoData
      row.getCell(8).value = videoData
      row.getCell(9).value = penghunianUnit
      row.getCell(10).value = belumSerahTerima
      row.getCell(11).value = sudahSerahTerima
      row.getCell(12).value = kondisibangunanBaik
      row.getCell(13).value = kondisibangunanRusakRingan
      row.getCell(14).value = kondisibangunanRusakSedang
      row.getCell(15).value = kondisibangunanRusakBerat
      row.getCell(16).value = statusPeresmianBelum
      row.getCell(17).value = statusPeresmianDiusulkan
      row.getCell(18).value = statusPeresmianSudah
      row.getCell(19).value = oporBelumDiusulkan
      row.getCell(20).value = oporDiusulkan
      row.getCell(21).value = opor
      row.getCell(22).value = waktuUpdate
    }

    i++
    const row = worksheet.getRow(i)

    row.getCell(2).value = 'TOTAL'
    row.getCell(3).value = 'SEMUA KEGIATAN'
    row.getCell(4).value = totalUnit
    row.getCell(5).value = totalData
    row.getCell(6).value = totalKoordinatData
    row.getCell(7).value = totalFotoData
    row.getCell(8).value = totalVideoData
    row.getCell(9).value = totalPenghunianUnit
    row.getCell(10).value = totalBelumSerahTerima
    row.getCell(11).value = totalSudahSerahTerima
    row.getCell(12).value = totalKondisibangunanBaik
    row.getCell(13).value = totalKondisibangunanRusakRingan
    row.getCell(14).value = totalKondisibangunanRusakSedang
    row.getCell(15).value = totalKondisibangunanRusakBerat
    row.getCell(16).value = totalStatusPeresmianBelum
    row.getCell(17).value = totalStatusPeresmianDiusulkan
    row.getCell(18).value = totalStatusPeresmianSudah
    row.getCell(19).value = totalOporBelumDiusulkan
    row.getCell(20).value = totalOporDiusulkan
    row.getCell(21).value = totalOpor

    row.commit()

    const fileName = `${keyName}-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = `laporan/${keyName}.xlsx`

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return {
      s3url,
      // data,
    }
  }

  static async findRekapKeterisian(query) {
    const { includeCount, order, limit, offset, ...queryFind } =
      PluginSqlizeQuery.generate(query, Profile, [
        { model: Provinsi, attributes: ['id', 'nama'] },
        { model: City, attributes: ['id', 'nama'] },
        { model: ProKegiatan, attributes: ['id', 'nama'] },
        {
          model: ProSatker,
          attributes: ['id', 'nama', 'id_balai'],
          // required: true,
          include: [
            {
              // required: true,
              model: ProBalai,
              attributes: ['id', 'nama'],
            },
          ],
        },
      ])

    queryFind.where = {
      ...queryFind.where,
      id_satker: {
        [Op.not]: null,
      },
      [Op.and]: [
        {
          id_type: {
            [Op.ne]: 3,
          },
        },
        {
          id_type: {
            [Op.not]: null,
          },
        },
      ],
    }

    let attrs = []
    Object.keys(keterisianDataPemanfaatan).forEach((n) => {
      // const j = n as unknown as keyof typeof keterisianDataPemanfaatan
      const j = n
      attrs = [...keterisianDataPemanfaatan[j].fields]
    })
    attrs = _.uniq(attrs)

    const data = await Profile.findAll({
      ...queryFind,
      attributes: [...attrs.filter((a) => !a.includes('.')), 'id_type'],
      // order: order || [['updatedAt', 'DESC']],
    })

    const count = await Profile.count({
      where: queryFind.where,
      include: includeCount,
    })

    const response = {
      data,
      count,
      message: 'Data berhasil diambil',
    }

    const result = {}

    // get uniq id_satker
    const idSatkers = _.uniq(_.map(data, 'id_satker'))

    _.forEach(idSatkers, (d) => {
      const pemanfaatans = _.filter(
        data,
        (r) => r.getDataValue('id_satker') === d
      )

      if (pemanfaatans.length > 0) {
        const firstV = pemanfaatans[0].get({ plain: true })

        const resSatkers = {}
        _.forEach(Object.keys(keterisianDataPemanfaatan), (n) => {
          // const j = n as unknown as keyof typeof keterisianDataPemanfaatan
          const j = n
          const satkers = _.filter(pemanfaatans, (r) => {
            return Number(r.getDataValue('id_type')) === Number(n)
          })
          const dataPemanfaatan = keterisianDataPemanfaatan[j]
          const { fields } = dataPemanfaatan

          // hitung jumlah field yang terisi
          let count = 0
          _.forEach(satkers, (satker) => {
            _.forEach(fields, (f) => {
              if (_.get(satker, f)) {
                count += 1
              }
            })
          })

          const totalCell = fields.length * satkers.length

          const kegiatan = {
            totalCell,
            jumlahCellTerisi: count,
            persentaseCellTerisi: Math.round((count / totalCell) * 100),
          }

          resSatkers[dataPemanfaatan.name] = kegiatan
        })

        _.forEach(
          _.filter(
            Object.keys(keterisianDataPemanfaatan),
            (r) => Number(r) !== 3
          ),
          (n) => {
            // const j = n as unknown as keyof typeof keterisianDataPemanfaatan
            const j = n
            if (!resSatkers?.[keterisianDataPemanfaatan[j].name]) {
              resSatkers[keterisianDataPemanfaatan[j].name] = {
                totalCell: 0,
                jumlahCellTerisi: 0,
                persentaseCellTerisi: 0,
              }
            }
          }
        )

        result[d] = {
          balaiId: _.get(firstV, 'ProSatker.id_balai'),
          name: _.get(firstV, 'ProSatker.nama'),
          balai: _.get(firstV, 'ProSatker.ProBalai'),
          satkers: _.map(Object.keys(resSatkers), (r) => {
            return {
              name: r,
              ...resSatkers[r],
            }
          }),
        }
      }
    })

    response.data = Object.values(result)

    // group by balaiId
    let groupedData = _.chain(response.data)
      .groupBy('balaiId')
      .map((value, key) => {
        const summaries = []
        const result = {
          balaiId: key,
          balai: value[0].balai,
          satker: _.map(value, (v) => {
            const kegiatans = [...v.satkers]

            const totalCell = _.sumBy(kegiatans, 'totalCell')
            const jumlahCellTerisi = _.sumBy(kegiatans, 'jumlahCellTerisi')

            const summary = {
              name: 'Total',
              totalCell,
              jumlahCellTerisi,
              persentaseCellTerisi: Math.round(
                (jumlahCellTerisi / totalCell) * 100
              ),
            }

            kegiatans.push(summary)
            summaries.push(summary)

            return {
              name: v.name,
              kegiatan: kegiatans,
              // summary,
            }
          }),
        }

        const totalCell = _.sumBy(summaries, 'totalCell')
        const jumlahCellTerisi = _.sumBy(summaries, 'jumlahCellTerisi')
        result.summary = {
          totalCell,
          jumlahCellTerisi,
          persentaseCellTerisi: Math.round(
            (jumlahCellTerisi / totalCell) * 100
          ),
        }

        return result
      })
      .value()

    // // jika order ada isinya, maka urutkan
    if ([true, 'true', false, 'false'].includes(query?.sort)) {
      const sort = query.sort === 'true' ? 'asc' : 'desc'

      // _.forEach(groupedData, (d) => {
      //   // _.forEach(d.satker, (s) => {
      //   //   // eslint-disable-next-line no-param-reassign
      //   //   s.kegiatan = _.orderBy(s.kegiatan, 'persentaseCellTerisi', sort)

      //   //   const total = _.findIndex(s.kegiatan, (k) => k.name === 'Total')
      //   //   if (total > -1) {
      //   //     const totalKegiatan = s.kegiatan[total]
      //   //     s.kegiatan.splice(total, 1)
      //   //     s.kegiatan.push(totalKegiatan)
      //   //   }
      //   // })

      //   // urutkan d.satker berdasarkan summary.persentaseCellTerisi
      //   // eslint-disable-next-line no-param-reassign
      //   d.satker = _.orderBy(d.satker, 'summary.persentaseCellTerisi', sort)
      // })

      // urutkan groupedData berdasarkan summary.persentaseCellTerisi
      groupedData = _.orderBy(groupedData, 'summary.persentaseCellTerisi', sort)
    }

    response.summary = {
      totalCell: 0,
      jumlahCellTerisi: 0,
      persentaseCellTerisi: 0,
    }

    _.forEach(groupedData, (d) => {
      _.forEach(d.satker, (s) => {
        _.forEach(s.kegiatan, (k) => {
          response.summary.totalCell += k.totalCell
          response.summary.jumlahCellTerisi += k.jumlahCellTerisi
        })
      })
    })

    response.summary.persentaseCellTerisi = Math.round(
      (response.summary.jumlahCellTerisi / response.summary.totalCell) * 100
    )

    response.data = groupedData

    return response
  }

  static async exportExcelRekapKeterisian(query) {
    const keyName = 'rekap-keterisian'

    const dataRekapKeterisian = await this.findRekapKeterisian(query)
    const data = dataRekapKeterisian.data

    const workbook = new excel.Workbook()

    const excelCols = [
      { header: 'No.', width: 6 },
      { header: 'Balai B2P', width: 50 },
      { header: 'Satuan Kerja', width: 50 },
      { header: 'Kegiatan', width: 50 },
      { header: 'Total Cell', width: 20 },
      { header: 'Jumlah Cell Terisi', width: 20 },
      { header: '% Cell Terisi', width: 20 },
    ]

    const worksheet = workbook.addWorksheet('Rekap Keterisian')
    worksheet.columns = excelCols

    let num = 1
    let i = 2

    for (const record of data) {
      const balaiB2P = record?.balai?.nama || '-'
      const satkers = record?.satker

      const row = worksheet.getRow(i)

      row.getCell(1).value = `${num}.`
      row.getCell(2).value = balaiB2P

      let posSatker = -1

      for (const satker of satkers) {
        posSatker++
        const satkerRow = worksheet.getRow(i + posSatker)

        const satuanKerja = satker?.name || '-'
        satkerRow.getCell(3).value = satuanKerja

        let posKegiatan = -1

        for (const kegiatan of satker?.kegiatan) {
          posKegiatan++
          const kegiatanRow = worksheet.getRow(i + posKegiatan)

          const kegiatanName = kegiatan?.name || '-'
          const totalCell = kegiatan?.totalCell || 0
          const jumlahCellTerisi = kegiatan?.jumlahCellTerisi || 0
          const persentaseCellTerisi = kegiatan?.persentaseCellTerisi || 0

          kegiatanRow.getCell(4).value = kegiatanName
          kegiatanRow.getCell(5).value = totalCell
          kegiatanRow.getCell(6).value = jumlahCellTerisi
          kegiatanRow.getCell(7).value = persentaseCellTerisi + '%'
        }
      }

      row.commit()

      num++
      i += 5
    }

    const fileName = `${keyName}-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = `laporan/${keyName}.xlsx`

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }

  static async findRekapKeterisianPerProvinsi(query) {
    const { includeCount, ...queryFind } = PluginSqlizeQuery.generate(
      query,
      PersentaseKeterisianDataPemanfaatan,
      []
    )
    const now = format(endOfDay(new Date()), 'yyyy-MM-dd HH:mm:ss')
    // const threeDaysAgo = format(
    //   startOfDay(subDays(new Date(), 3)),
    //   'yyyy-MM-dd HH:mm:ss'
    // )

    const threeDaysAgo = '2019-1-1 00:00:00'

    const response = await PersentaseKeterisianDataPemanfaatan.findAll({
      ...queryFind,
      include: [
        {
          model: Provinsi,
          attributes: ['nama'],
        },
      ],
      where: {
        ...queryFind.where,
        createdAt: {
          [Op.between]: [threeDaysAgo, now],
        },
      },
      order: [
        ['ProvinsiId', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    })

    const groupedData = _.groupBy(response, (r) => r.ProvinsiId)
    const result = {}

    const summary = {}

    _.forIn(groupedData, (data, k) => {
      const dataLength = data.length
      const dataLengthLimit = dataLength > 3 ? 3 : dataLength
      const datanol = { ...data[0].get({ plain: true }) }
      const fixData = {
        provinsi: {
          nama: datanol?.Provinsi?.nama,
          id: k,
        },
        data: _.map([...data].slice(0, dataLengthLimit), (d) => {
          const tanggal = format(new Date(d.createdAt), 'dd MMMM yyyy', {
            locale: idLocale,
          })

          const prevSum = summary?.[tanggal]
          if (!_.isEmpty(prevSum)) {
            const newData = {
              totalCell: prevSum.totalCell + Number(d.totalCell),
              totalCellTerisi:
                prevSum.totalCellTerisi + Number(d.totalCellTerisi),
            }
            summary[tanggal] = {
              ...newData,
              persentaseCellTerisi: Math.round(
                (newData.totalCellTerisi / newData.totalCell) * 100
              ),
            }
          } else {
            summary[tanggal] = {
              totalCell: Number(d.totalCell),
              totalCellTerisi: Number(d.totalCellTerisi),
              persentaseCellTerisi: Math.round(
                (Number(d.totalCellTerisi) / Number(d.totalCell)) * 100
              ),
            }
          }
          return {
            totalCell: d.totalCell,
            totalCellTerisi: d.totalCellTerisi,
            persentaseCellTerisi: d.persentaseCellTerisi,
            // tanggal: format(new Date(d.createdAt as any), 'yyyy-MM-dd'),
            tanggal,
          }
        }),
      }

      if (dataLength > 1) {
        const lastData = data[dataLength - 1]
        const prevData = data[dataLength - 2]
        const lastPersentase = lastData.persentaseCellTerisi
        const prevPersentase = prevData.persentaseCellTerisi
        const peningkatanPersentase = lastPersentase - prevPersentase
        fixData.peningkatanPersentase = peningkatanPersentase
      } else {
        fixData.peningkatanPersentase = 0
      }

      result[k] = fixData
    })

    const summeries = {
      nama: 'Total',
      data: _.map(summary, (v, k, record) => {
        return {
          tanggal: k,
          ...v,
        }
      }),
    }

    if (summeries.data.length > 1) {
      const lastData = summeries.data[summeries.data.length - 1]
      const prevData = summeries.data[summeries.data.length - 2]
      const lastPersentase = lastData.persentaseCellTerisi
      const prevPersentase = prevData.persentaseCellTerisi
      const peningkatanPersentase = lastPersentase - prevPersentase
      summeries.peningkatanPersentase = peningkatanPersentase
    } else {
      summeries.peningkatanPersentase = 0
    }

    return {
      // groupedData,
      data: _.values(result),
      summary: summeries,
    }
  }

  static async exportExcelRekapKeterisianPerProvinsi(query) {
    const keyName = 'rekap-keterisian-per-provinsi'

    const dataRekapKeterisian = await this.findRekapKeterisianPerProvinsi(query)
    const data = dataRekapKeterisian?.data

    if (!(Array.isArray(data) && data.length > 0)) {
      throw new ResponseError.BadRequest('Data kosong')
    }

    const workbook = new excel.Workbook()

    const excelCols = [{ header: 'Provinsi', width: 30 }]

    for (const record of data[0].data) {
      const header = record?.tanggal || '-'
      excelCols.push({ header, width: 20 })
    }

    excelCols.push({ header: 'Peningkatan Keterisian (%)', width: 30 })

    const worksheet = workbook.addWorksheet('Rekap Keterisian Per Provinsi')
    worksheet.columns = excelCols

    let i = 1

    for (const record of data) {
      i++

      const provinsi = record?.provinsi?.nama || '-'
      const peningkatanPersentase = record.peningkatanPersentase
        ? `${record.peningkatanPersentase}%`
        : '0%'
      const recordData = record?.data

      const row = worksheet.getRow(i)
      row.getCell(1).value = provinsi

      let vIndex = 1
      for (const cell of recordData) {
        vIndex++
        const persentaseCellTerisi = cell.persentaseCellTerisi
          ? `${cell.persentaseCellTerisi}%`
          : '0%'
        row.getCell(vIndex).value = persentaseCellTerisi
      }

      vIndex++
      row.getCell(vIndex).value = peningkatanPersentase

      row.commit()
    }

    const fileName = `${keyName}-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = `laporan/${keyName}.xlsx`

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return { s3url }
  }

  static async findRekapPeresmian(query) {
    const { jenis, ProvinsiId } = query

    let conditions = {}

    if (jenis && jenis != 'semua') {
      conditions = {
        ...conditions,
        jenis,
      }
    }

    if (ProvinsiId) {
      conditions = {
        ...conditions,
        ProvinsiId,
      }
    }

    const peresmian = await Peresmian.findAll({
      include: [
        {
          model: Provinsi,
        },
      ],
      where: {
        ...conditions,
      },
    })

    return peresmian
  }

  static async findRp3kp(query) {
    const provinsis = await ProfRp3kp.findAll({
      include: [
        {
          model: Provinsi,
          attributes: ['nama'],
        },
      ],
      where: {
        CityId: null,
      },
    })

    const kabupatens = await ProfRp3kp.findAll({
      include: [
        {
          model: City,
          attributes: ['nama'],
        },
      ],
      where: {
        CityId: {
          [Op.not]: null,
        },
      },
    })

    const result = []

    const parsedProvinsis = JSON.parse(JSON.stringify(provinsis))
    const parsedKabupatens = JSON.parse(JSON.stringify(kabupatens))

    for (const provinsi of parsedProvinsis) {
      result.push({
        ...provinsi,
        kabupatens: [
          ...filter(parsedKabupatens, (o) => {
            return o.ProvinsiId === provinsi.ProvinsiId
          }),
        ],
      })
    }

    return result
  }

  static async findPokjaPkp(query) {
    const provinsis = await ProfPkp.findAll({
      include: [
        {
          model: Provinsi,
          attributes: ['nama'],
        },
      ],
      where: {
        type: 'pokja',
        CityId: null,
      },
    })

    const kabupatens = await ProfPkp.findAll({
      include: [
        {
          model: City,
          attributes: ['nama'],
        },
      ],
      where: {
        type: 'pokja',
        CityId: {
          [Op.not]: null,
        },
      },
    })

    const result = []

    const parsedProvinsis = JSON.parse(JSON.stringify(provinsis))
    const parsedKabupatens = JSON.parse(JSON.stringify(kabupatens))

    for (const provinsi of parsedProvinsis) {
      result.push({
        ...provinsi,
        kabupatens: [
          ...filter(parsedKabupatens, (o) => {
            return o.ProvinsiId === provinsi.ProvinsiId
          }),
        ],
      })
    }

    return result
  }

  static async findForumPkp(query) {
    const provinsis = await ProfPkp.findAll({
      include: [
        {
          model: Provinsi,
          attributes: ['nama'],
        },
      ],
      where: {
        type: 'forum',
        CityId: null,
      },
    })

    const kabupatens = await ProfPkp.findAll({
      include: [
        {
          model: City,
          attributes: ['nama'],
        },
      ],
      where: {
        type: 'forum',
        CityId: {
          [Op.not]: null,
        },
      },
    })

    const result = []

    const parsedProvinsis = JSON.parse(JSON.stringify(provinsis))
    const parsedKabupatens = JSON.parse(JSON.stringify(kabupatens))

    for (const provinsi of parsedProvinsis) {
      result.push({
        ...provinsi,
        kabupatens: [
          ...filter(parsedKabupatens, (o) => {
            return o.ProvinsiId === provinsi.ProvinsiId
          }),
        ],
      })
    }

    return result
  }

  static async rekapP3KEProvinsi() {
    try {
      await PusdatinAPIGW.login()

      const fetchKKProvinsi = await axios.get(
        'https://apigw.pu.go.id/v1/p3ke/rekapitulasi/status_kesejahteraan/provinsi',
        {
          headers: {
            'X-DreamFactory-Api-Key':
              '847ae281a20a102b44752ae4d3b5c0035def0159e3de0f6cd8d32f4d79c80f2c',
            'X-DreamFactory-Session-Token': PusdatinAPIGW.token,
          },
        }
      )
      const fetchKKProvinsiResponse = fetchKKProvinsi.data

      const provinsis = await Provinsi.findAll({
        attributes: ['id', 'nama', 'latitude', 'longitude'],
        where: {
          id: {
            [Op.not]: 31,
          },
        },
      })

      const capaians = await ProfP3KECapaian.findAll({
        where: {
          ProvinsiId: {
            [Op.not]: 31,
          },
        },
      })
      const parsedCapaians = JSON.parse(JSON.stringify(capaians))
      const groupedCapaians = _.groupBy(parsedCapaians, 'periode')
      let capaianTemplate = []
      for (const [key, value] of Object.entries(groupedCapaians)) {
        capaianTemplate.push({
          periode: Number(key),
          djpReguler: 0,
          djpNahp: 0,
          baznasKomplementer: 0,
          baznasUnitKeseluruhan: 0,
        })
      }
      capaianTemplate = _.sortBy(capaianTemplate, ['periode'])

      const rencanaPenanganans = await ProfP3KERencanaPenanganan.findAll({
        where: {
          ProvinsiId: {
            [Op.not]: 31,
          },
        },
      })
      const parsedRencanaPenanganans = JSON.parse(
        JSON.stringify(rencanaPenanganans)
      )
      const groupedRencanaPenanganans = _.groupBy(
        parsedRencanaPenanganans,
        'periode'
      )
      let rencanaPenangananTemplate = []
      for (const [key, value] of Object.entries(groupedRencanaPenanganans)) {
        rencanaPenangananTemplate.push({
          periode: Number(key),
          rencanaReguler: 0,
          rencanaNahp: 0,
        })
      }
      rencanaPenangananTemplate = _.sortBy(rencanaPenangananTemplate, [
        'periode',
      ])

      const result = [
        {
          id: 0,
          nama: 'NASIONAL',
          jumlahKK: {
            desil1: 0,
            desil2: 0,
            desil3: 0,
            desil4: 0,
            total: 0,
          },
          capaian: JSON.parse(JSON.stringify(capaianTemplate)),
          rencanaPenanganan: JSON.parse(
            JSON.stringify(rencanaPenangananTemplate)
          ),
        },
      ]

      for (const provinsi of provinsis) {
        const prov = {
          id: provinsi.id,
          nama: provinsi.getDataValue('nama'),
          latitude: provinsi.getDataValue('latitude'),
          longitude: provinsi.getDataValue('longitude'),
          jumlahKK: {
            desil1: 0,
            desil2: 0,
            desil3: 0,
            desil4: 0,
            total: 0,
          },
          capaian: JSON.parse(JSON.stringify(capaianTemplate)),
          rencanaPenanganan: JSON.parse(
            JSON.stringify(rencanaPenangananTemplate)
          ),
        }

        if (fetchKKProvinsiResponse.resource) {
          // eslint-disable-next-line camelcase
          const kkProv = _.filter(
            fetchKKProvinsiResponse.resource,
            (o) => Number(o.kode_provinsi) === Number(prov.id)
          )

          // eslint-disable-next-line camelcase
          prov.jumlahKK.desil1 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 1)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          prov.jumlahKK.desil2 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 2)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          prov.jumlahKK.desil3 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 3)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          prov.jumlahKK.desil4 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 4)?.jml_keluarga ||
            0

          prov.jumlahKK.total =
            prov.jumlahKK.desil1 +
            prov.jumlahKK.desil2 +
            prov.jumlahKK.desil3 +
            prov.jumlahKK.desil4
        }

        // process input
        let index = 0
        for (const cap of capaianTemplate) {
          const data = _.filter(parsedCapaians, (o) => {
            return o.ProvinsiId === prov.id && o.periode === cap.periode
          })

          if (data.length > 0) {
            prov.capaian[index].djpReguler = _.sumBy(data, (o) =>
              Number(o.djpReguler)
            )
            prov.capaian[index].djpNahp = _.sumBy(data, (o) =>
              Number(o.djpNahp)
            )
            prov.capaian[index].baznasKomplementer = _.sumBy(data, (o) =>
              Number(o.baznasKomplementer)
            )
            prov.capaian[index].baznasUnitKeseluruhan = _.sumBy(data, (o) =>
              Number(o.baznasUnitKeseluruhan)
            )

            result[0].capaian[index].djpReguler +=
              prov.capaian[index].djpReguler
            result[0].capaian[index].djpNahp += prov.capaian[index].djpNahp
            result[0].capaian[index].baznasKomplementer +=
              prov.capaian[index].baznasKomplementer
            result[0].capaian[index].baznasUnitKeseluruhan +=
              prov.capaian[index].baznasUnitKeseluruhan
          }

          index++
        }

        // process input
        index = 0
        for (const ren of rencanaPenangananTemplate) {
          const data = _.filter(parsedRencanaPenanganans, (o) => {
            return o.ProvinsiId === prov.id && o.periode === ren.periode
          })

          if (data.length > 0) {
            prov.rencanaPenanganan[index].rencanaReguler = _.sumBy(data, (o) =>
              Number(o.rencanaReguler)
            )
            prov.rencanaPenanganan[index].rencanaNahp = _.sumBy(data, (o) =>
              Number(o.rencanaNahp)
            )

            result[0].rencanaPenanganan[index].rencanaReguler +=
              prov.rencanaPenanganan[index].rencanaReguler
            result[0].rencanaPenanganan[index].rencanaNahp +=
              prov.rencanaPenanganan[index].rencanaNahp
          }

          index++
        }

        result.push(prov)
      }

      // summary
      const data = _.filter(result, (o) => o.id > 0)
      result[0].jumlahKK.desil1 = _.sumBy(data, 'jumlahKK.desil1')
      result[0].jumlahKK.desil2 = _.sumBy(data, 'jumlahKK.desil2')
      result[0].jumlahKK.desil3 = _.sumBy(data, 'jumlahKK.desil3')
      result[0].jumlahKK.desil4 = _.sumBy(data, 'jumlahKK.desil4')
      result[0].jumlahKK.total = _.sumBy(data, 'jumlahKK.total')

      return {
        result,
      }
    } catch (error) {
      console.log(error)
      return {
        error,
      }
    }
  }

  static async rekapP3KEKabKota(req) {
    const { provinsiId } = req.query

    try {
      await PusdatinAPIGW.login()

      const fetchKKKabKota = await axios.get(
        'https://apigw.pu.go.id/v1/p3ke/rekapitulasi/status_kesejahteraan/kab_kota',
        {
          headers: {
            'X-DreamFactory-Api-Key':
              '847ae281a20a102b44752ae4d3b5c0035def0159e3de0f6cd8d32f4d79c80f2c',
            'X-DreamFactory-Session-Token': PusdatinAPIGW.token,
          },
        }
      )
      const fetchKKKabKotaResponse = fetchKKKabKota.data

      const provinsi = await Provinsi.findOne({
        attributes: ['id', 'nama', 'latitude', 'longitude'],
        where: {
          id: provinsiId,
        },
      })

      const kabkotas = await City.findAll({
        attributes: ['id', 'nama', 'latitude', 'longitude'],
        where: {
          ProvinsiId: provinsiId,
        },
      })

      const capaians = await ProfP3KECapaian.findAll({
        where: {
          ProvinsiId: provinsiId,
          KabupatenId: {
            [Op.not]: null,
          },
        },
      })
      const parsedCapaians = JSON.parse(JSON.stringify(capaians))
      const groupedCapaians = _.groupBy(parsedCapaians, 'periode')
      let capaianTemplate = []
      for (const [key, value] of Object.entries(groupedCapaians)) {
        capaianTemplate.push({
          periode: Number(key),
          djpReguler: 0,
          djpNahp: 0,
          baznasKomplementer: 0,
          baznasUnitKeseluruhan: 0,
        })
      }
      capaianTemplate = _.sortBy(capaianTemplate, ['periode'])

      const rencanaPenanganans = await ProfP3KERencanaPenanganan.findAll({
        where: {
          ProvinsiId: provinsiId,
          KabupatenId: {
            [Op.not]: null,
          },
        },
      })
      const parsedRencanaPenanganans = JSON.parse(
        JSON.stringify(rencanaPenanganans)
      )
      const groupedRencanaPenanganans = _.groupBy(
        parsedRencanaPenanganans,
        'periode'
      )
      let rencanaPenangananTemplate = []
      for (const [key, value] of Object.entries(groupedRencanaPenanganans)) {
        rencanaPenangananTemplate.push({
          periode: Number(key),
          rencanaReguler: 0,
          rencanaNahp: 0,
        })
      }
      rencanaPenangananTemplate = _.sortBy(rencanaPenangananTemplate, [
        'periode',
      ])

      const result = [
        {
          id: 0,
          nama: provinsi?.getDataValue('nama'),
          latitude: provinsi?.getDataValue('latitude'),
          longitude: provinsi?.getDataValue('longitude'),
          jumlahKK: {
            desil1: 0,
            desil2: 0,
            desil3: 0,
            desil4: 0,
            total: 0,
          },
          capaian: JSON.parse(JSON.stringify(capaianTemplate)),
          rencanaPenanganan: JSON.parse(
            JSON.stringify(rencanaPenangananTemplate)
          ),
        },
      ]

      for (const kabkota of kabkotas) {
        const kabkot = {
          id: kabkota.id,
          nama: kabkota.getDataValue('nama'),
          latitude: kabkota.getDataValue('latitude'),
          longitude: kabkota.getDataValue('longitude'),
          jumlahKK: {
            desil1: 0,
            desil2: 0,
            desil3: 0,
            desil4: 0,
            total: 0,
          },
          capaian: JSON.parse(JSON.stringify(capaianTemplate)),
          rencanaPenanganan: JSON.parse(
            JSON.stringify(rencanaPenangananTemplate)
          ),
        }

        if (fetchKKKabKotaResponse.resource) {
          // eslint-disable-next-line camelcase
          const kkProv = _.filter(
            fetchKKKabKotaResponse.resource,
            (o) => Number(o.kode_kab_kota) === Number(kabkot.id)
          )

          // eslint-disable-next-line camelcase
          kabkot.jumlahKK.desil1 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 1)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          kabkot.jumlahKK.desil2 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 2)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          kabkot.jumlahKK.desil3 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 3)?.jml_keluarga ||
            0
          // eslint-disable-next-line camelcase
          kabkot.jumlahKK.desil4 =
            _.find(kkProv, (o) => o.status_kesejahteraan === 4)?.jml_keluarga ||
            0

          kabkot.jumlahKK.total =
            kabkot.jumlahKK.desil1 +
            kabkot.jumlahKK.desil2 +
            kabkot.jumlahKK.desil3 +
            kabkot.jumlahKK.desil4
        }

        // process input
        let index = 0
        for (const cap of capaianTemplate) {
          const data = _.find(parsedCapaians, (o) => {
            return o.KabupatenId === kabkot.id && o.periode === cap.periode
          })

          if (data) {
            kabkot.capaian[index].djpReguler = data.djpReguler || 0
            kabkot.capaian[index].djpNahp = data.djpNahp || 0
            kabkot.capaian[index].baznasKomplementer =
              data.baznasKomplementer || 0
            kabkot.capaian[index].baznasUnitKeseluruhan =
              data.baznasUnitKeseluruhan || 0

            result[0].capaian[index].djpReguler +=
              kabkot.capaian[index].djpReguler
            result[0].capaian[index].djpNahp += kabkot.capaian[index].djpNahp
            result[0].capaian[index].baznasKomplementer +=
              kabkot.capaian[index].baznasKomplementer
            result[0].capaian[index].baznasUnitKeseluruhan +=
              kabkot.capaian[index].baznasUnitKeseluruhan
          }

          index++
        }

        // process input
        index = 0
        for (const ren of rencanaPenangananTemplate) {
          const data = _.find(parsedRencanaPenanganans, (o) => {
            return o.KabupatenId === kabkot.id && o.periode === ren.periode
          })

          if (data) {
            kabkot.rencanaPenanganan[index].rencanaReguler =
              data.rencanaReguler || 0
            kabkot.rencanaPenanganan[index].rencanaNahp = data.rencanaNahp || 0

            result[0].rencanaPenanganan[index].rencanaReguler +=
              kabkot.rencanaPenanganan[index].rencanaReguler
            result[0].rencanaPenanganan[index].rencanaNahp +=
              kabkot.rencanaPenanganan[index].rencanaNahp
          }

          index++
        }

        result.push(kabkot)
      }

      // summary
      const data = _.filter(result, (o) => o.id > 0)
      result[0].jumlahKK.desil1 = _.sumBy(data, 'jumlahKK.desil1')
      result[0].jumlahKK.desil2 = _.sumBy(data, 'jumlahKK.desil2')
      result[0].jumlahKK.desil3 = _.sumBy(data, 'jumlahKK.desil3')
      result[0].jumlahKK.desil4 = _.sumBy(data, 'jumlahKK.desil4')
      result[0].jumlahKK.total = _.sumBy(data, 'jumlahKK.total')

      return {
        result,
      }
    } catch (error) {
      console.log(error)
      return {
        error,
      }
    }
  }
}

export default DashboardService
