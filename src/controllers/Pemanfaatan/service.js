import fs from 'fs'
import excel from 'exceljs'
import _ from 'lodash'
import sequelize, { Op } from 'sequelize'
import models from '../../database/models'
import { uploadFileToS3, removeS3File } from '../../helpers/s3Helper'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import ResponseError from '../../modules/Error'
import NotificationService from '../../controllers/Notification/service'
import PemanfaatanUsulanService from '../../controllers/PemanfaatanUsulan/service'
import { TYPE_SERAH_TERIMA } from '../../constants/SerahTerima'

const {
  Profile,
  ProKegiatan,
  ProOutput,
  ProSatker,
  ProTargetGroup,
  Provinsi,
  City,
  Kecamatan,
  Desa,
  KegiatanOpor,
  ProProgram,
  ProUnor,
  ProSubOutput,
  ProType,
  ProUker,
  MasterKelompokPengusul,
  MasterTematikPemanfaatan,
  MasterMajorProjectPemanfaatan,
  MasterKegiatanOPOR,
  MasterKondisiBangunan,
  ProBalai,
  ProfileTematikPemanfaatan,
  PenerimaManfaat,
  SerahTerimaComment,
  SerahTerimaUnit,
} = models

const listColumnTypes = {
  numbers: [
    'id',
    'id_program',
    'id_kegiatan',
    'id_type',
    'id_output',
    'id_tgt_hunian',
    'jml_unit',
    'tower',
    'jml_lantai',
    'thn_bang',
    'thn_selesaibang',

    'id_provinsi',
    'id_kabkota',
    'id_kecamatan',
    'id_keldesa',
    'latitude',
    'longitude',

    'id_satker',
    'myc',
    'KelompokPengusulId',

    'biaya_pembangunan',
    'biaya_perencanaan',
    'biaya_pengawasan',
    'tot_biaya',

    'status_penghunian_id',
    'thn_huni',
    'jml_unit_huni',
    'jml_tower_huni',

    'stat_srh_trm',
    'thn_serah_aset',
    'KondisiBangunanId',
    'status_peresmian',
  ],
  dates: ['tgl_kontrak_pemb', 'tanggal_target_terhuni'],
}

class PemanfaatanService {
  static findSerahTerima(req) {
    const { hibah, alihstatus } = req.query
    let serahTerimaFind = {}
    if (hibah && alihstatus) {
      serahTerimaFind = {
        [Op.or]: [
          {
            serahTerimaType: TYPE_SERAH_TERIMA[0],
            serahTerimaStatus: {
              [Op.in]: JSON.parse(hibah),
            },
          },
          {
            serahTerimaType: TYPE_SERAH_TERIMA[1],
            serahTerimaStatus: {
              [Op.in]: JSON.parse(alihstatus),
            },
          },
        ],
      }

      return serahTerimaFind
    }

    if (hibah) {
      serahTerimaFind = {
        ...serahTerimaFind,
        serahTerimaType: TYPE_SERAH_TERIMA[0],
        serahTerimaStatus: {
          [Op.in]: JSON.parse(hibah),
        },
      }
    }
    if (alihstatus) {
      serahTerimaFind = {
        ...serahTerimaFind,
        serahTerimaType: TYPE_SERAH_TERIMA[1],
        serahTerimaStatus: {
          [Op.in]: JSON.parse(alihstatus),
        },
      }
    }

    return serahTerimaFind
  }

  static async plainQueryProfile(
    req,
    res,
    options = {
      withTotal: false,
      includes: [],
      where: {},
    }
  ) {
    try {
      let { filtered } = req.query
      filtered =
        ['undefined', 'null', null, undefined].indexOf(filtered) === -1
          ? JSON.parse(filtered)
          : {}

      //filter serahTerimaPemanfaatan
      const indexSerahTerimaPemanfaatan = _.findIndex(
        filtered,
        (item) => item.id === 'serahTerimaPemanfaatan'
      )
      let serahTerimaPemanfaatan = _.find(
        filtered,
        (item) => item.id === 'serahTerimaPemanfaatan'
      )
      if (Array.isArray(filtered) && indexSerahTerimaPemanfaatan !== -1) {
        filtered.splice(indexSerahTerimaPemanfaatan, 1)
        req.query = { ...req.query, filtered }
      }

      const { includeCount, order, limit, ...queryFind } =
        PluginSqlizeQuery.generate(req.query, Profile, options?.includes || [])

      //filter serahTerimaPemanfaatan
      if (serahTerimaPemanfaatan) {
        queryFind.where = {
          ...queryFind.where,
          serahTerimaPemanfaatan: {
            [Op.or]: [
              sequelize.where(
                sequelize.col('serahTerimaPemanfaatan'), // Just 'data' also works if no joins
                Op.like,
                sequelize.literal(`\"%${serahTerimaPemanfaatan.value}%\"`)
              ),
              // sequelize.where(
              //   `JSON_CONTAINS(serahTerimaPemanfaatan, '${serahTerimaPemanfaatan.value}' )`
              // ),
            ],
          },
        }
      }

      // search serah terima by statuses
      const serahTerimaFind = this.findSerahTerima(req)

      queryFind.where = {
        ...queryFind.where,
        ...options?.where,
        ...serahTerimaFind,
      }

      const data = await Profile.findAll({
        ...queryFind,
        order: order.length ? order : [['createdAt', 'desc']],
        limit,
      })

      const response = {
        message: 'success',
        data,
      }

      if (options?.withTotal) {
        response.total = await Profile.count({
          ...queryFind,
          include: includeCount,
        })
      }

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

  static async findAllPaginate(req, res) {
    return await this.plainQueryProfile(req, res, {
      withTotal: true,
      includes: [
        { model: Provinsi },
        { model: City },
        { model: Kecamatan },
        { model: Desa },
        { model: ProProgram },
        { model: ProKegiatan },
        { model: ProUnor },
        { model: ProUker },
        { model: ProSatker },
        { model: ProOutput },
        { model: ProSubOutput },
        { model: ProType },
        { model: ProTargetGroup },
      ],
    })
  }

  static async exportExcel(req, res) {
    if (!req.query.filtered || req.query.filtered === '[]') {
      throw new ResponseError.BadRequest('Silahkan pilih setidaknya 1 filter')
    }

    const workbook = new excel.Workbook()

    try {
      const includes = [
        {
          model: Provinsi,
        },
        {
          model: City,
        },
        {
          model: Kecamatan,
        },
        {
          model: Desa,
        },
        {
          model: ProKegiatan,
        },
        {
          model: ProSatker,
        },
        {
          model: ProOutput,
        },
      ]

      const { includeCount, order, limit, ...queryFind } =
        PluginSqlizeQuery.generate(req.query, Profile, includes)

      const daftarPemanfaatan = await Profile.findAll({
        ...queryFind,
        order: order.length ? order : [['createdAt', 'desc']],
        raw: true,
        nest: true,
        limit: null,
        offset: null,
      })

      const extractedDaftarPemanfaatan = daftarPemanfaatan.map((item) => {
        const latitude = parseFloat(item.latitude) || null
        const longitude = parseFloat(item.longitude) || null
        let photos = []
        let videos = []

        try {
          photos = JSON.parse(item.foto).map(
            (photo) => `https://sibaru.perumahan.pu.go.id/sibaru/${photo.path}`
          )
          // eslint-disable-next-line no-empty
        } catch (error) {}

        try {
          videos = JSON.parse(item.video).map(
            (video) => `https://sibaru.perumahan.pu.go.id/sibaru/${video.path}`
          )
          // eslint-disable-next-line no-empty
        } catch (error) {}

        return {
          ...item,
          no_usulan: '',
          kode_kegiatan: item.id_kegiatan
            ? item.ProKegiatan && item.ProKegiatan.kode
            : null,
          kegiatan:
            item.kegiatan ||
            (item.ProKegiatan && item.ProKegiatan.nama) ||
            null,

          kode_output: item.id_output
            ? item.ProOutput && item.ProOutput.kode
            : null,
          output:
            item.output || (item.ProOutput && item.ProOutput.nama) || null,

          kode_provinsi:
            item.id_provinsi || (item.Provinsi && item.Provinsi.id) || null,
          provinsi:
            item.provinsi || (item.Provinsi && item.Provinsi.nama) || null,

          kode_kabkota: item.id_kabkota || (item.City && item.City.id) || null,
          kabkota: item.kab_kota || (item.City && item.City.nama) || null,

          kode_kecamatan:
            item.id_kecamatan || (item.Kecamatan && item.Kecamatan.id) || null,
          kecamatan:
            item.kecamatan || (item.Kecamatan && item.Kecamatan.nama) || null,

          kode_desa: item.id_keldesa || (item.Desa && item.Desa.id) || null,
          desa: item.keldesa || (item.Desa && item.Desa.nama) || null,

          satker:
            item.satker || (item.ProSatker && item.ProSatker.nama) || null,
          tgt_hunian: item.tgt_hunian || null,
          latitude,
          longitude,
          photos: photos.join('\n'),
          videos: videos.join('\n'),
        }
      })

      const excelCols = [
        { header: 'Tahun Pembangunan', key: 'thn_bang', width: 20 },
        { header: 'Kode Usulan', key: 'no_usulan', width: 20 },
        { header: 'Kode Kegiatan', key: 'kode_kegiatan', width: 20 },
        { header: 'Kegiatan', key: 'kegiatan', width: 32 },
        { header: 'Kode Output', key: 'kode_output', width: 20 },
        { header: 'Output', key: 'output', width: 24 },
        { header: 'Kode Provinsi', key: 'kode_provinsi', width: 20 },
        { header: 'Provinsi', key: 'provinsi', width: 32 },
        { header: 'Kode Kabupaten/Kota', key: 'kode_kabkota', width: 20 },
        { header: 'Kabupaten/Kota', key: 'kabkota', width: 32 },
        { header: 'Kode Kecamatan', key: 'kode_kecamatan', width: 20 },
        { header: 'Kecamatan', key: 'kecamatan', width: 32 },
        { header: 'Kode Desa', key: 'kode_desa', width: 20 },
        { header: 'Desa', key: 'desa', width: 32 },
        { header: 'Alamat', key: 'alamat', width: 64 },
        { header: 'Nama Perumahan', key: 'nm_perumahan', width: 32 },
        { header: 'Satuan Kerja', key: 'satker', width: 32 },
        { header: 'Penerima Manfaat', key: 'tgt_hunian', width: 20 },
        { header: 'Total Anggaran', key: 'tot_biaya', width: 24 },
        { header: 'Latitude', key: 'latitude', width: 20 },
        { header: 'Longitude', key: 'longitude', width: 24 },
        { header: 'Foto', key: 'photos', width: 64 },
        { header: 'Video', key: 'videos', width: 64 },
        { header: 'Status Serah Terima', key: 'stat_srh_trm', width: 32 },
      ]

      const worksheet = workbook.addWorksheet('Daftar Pemanfaatan')
      worksheet.columns = excelCols

      worksheet.addRows(extractedDaftarPemanfaatan)

      worksheet.eachRow((col, index) => {
        if (index === 1) {
          col.font = { bold: true }
        }

        col.alignment = { wrapText: true }
      })

      // res.setHeader(
      //   'Content-Type',
      //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      // )

      // res.setHeader(
      //   'Content-Disposition',
      //   'attachment; filename=Daftar-Pemanfaatan.xlsx'
      // )

      // return workbook.xlsx.write(res).then(() => {
      //   res.status(200).end()
      // })
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal generate excel')
    }

    const fileName = `pemanfaatan-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = 'laporan/pemanfaatan.xlsx'

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return s3url
  }

  static async exportExcelKegiatan(query) {
    const { tahun, sampaiTahun } = query

    const workbook = new excel.Workbook()

    let data = await Profile.findAll({
      where: {
        thn_bang: {
          [Op.between]: [tahun, sampaiTahun],
        },
      },
      group: ['id_provinsi', 'dataKegiatan'],
      raw: true,
      include: [{ model: Provinsi, attributes: ['id', 'nama'] }],
      attributes: [
        // 'provinsi',
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

    let groupedData = _.chain(data)
      .sortBy('dataKegiatan')
      .groupBy('dataKegiatan')
      .value()

    for (const [key, value] of Object.entries(groupedData)) {
      if (key != 'null') {
        const worksheet = workbook.addWorksheet(key)
        // setExcelHeader(worksheet)
        // setExcelData(worksheet, value)
      }
    }

    const fileName = `kegiatan-pemanfaatan-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = 'laporan/kegiatan-pemanfaatan.xlsx'

    try {
      await removeS3File(s3key)
      s3url = await uploadFileToS3(fileSource, s3key, true)
      fs.unlinkSync(fileSource)
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengupload file ke S3')
    }

    return s3url
  }

  static async getFilterTahun(req, res) {
    const allTahun = await Profile.findAll({
      attributes: ['thn_bang'],
      group: ['thn_bang'],
      order: sequelize.literal('thn_bang DESC'),
    })

    const allTahunSelesai = await Profile.findAll({
      attributes: ['thn_selesaibang'],
      group: ['thn_selesaibang'],
      order: sequelize.literal('thn_selesaibang DESC'),
    })

    return res.status(200).json({
      message: 'success',
      data: {
        thn_bang: allTahun,
        thn_selesaibang: allTahunSelesai,
      },
    })
  }

  static async getFilterKuning(req, res) {
    try {
      let provinsi = await Provinsi.findAll({
        attributes: ['id', 'nama'],
      })
      let kabupaten = await City.findAll({
        attributes: ['id', 'nama', 'ProvinsiId'],
      })
      let kecamatan = await Kecamatan.findAll({
        attributes: ['id', 'nama', 'CityId'],
      })
      let desa = await Desa.findAll({
        attributes: ['id', 'nama', 'KecamatanId'],
      })

      let program = await ProProgram.findAll({
        attributes: ['id', 'nama'],
      })
      let kegiatan = await ProKegiatan.findAll({
        attributes: ['id', 'nama', 'id_program'],
      })
      let output = await ProOutput.findAll({
        attributes: ['id', 'nama', 'id_kegiatan'],
      })

      //tahun
      let allTahun = await Profile.findAll({
        attributes: ['thn_bang'],
        group: ['thn_bang'],
        order: sequelize.literal('thn_bang DESC'),
      })
      let tahun = []
      allTahun.forEach((tah) => {
        tahun.push(tah.dataValues.thn_bang)
      })

      return res.status(200).json({
        message: 'success',
        provinsi,
        kabupaten,
        kecamatan,
        desa,

        program,
        kegiatan,
        output,

        tahunBang: tahun,
      })
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return res.status(500).json({ message })
    }
  }

  static async getFilterMaster(req, res) {
    try {
      const tahun = await Profile.findAll({
        attributes: ['thn_bang'],
        group: ['thn_bang'],
      })

      const provinsi = await Provinsi.findAll({
        attributes: ['id', 'nama'],
      })

      const kabupaten = await City.findAll({
        attributes: ['id', 'nama', 'ProvinsiId'],
      })

      const types = await ProType.findAll({
        attributes: ['id', 'nama'],
      })

      const penerimamanfaat = await PenerimaManfaat.findAll({
        attributes: ['id', 'tipe'],
        where: {
          // Data Penerima manfaat double
          // MBR
          // dan TNI
          id: { $notIn: [21, 15] },
        },
      })

      const daftarTematikPemanfaatan = await MasterTematikPemanfaatan.findAll({
        attributes: ['id', 'nama'],
      })

      return res.status(200).json({
        message: 'success',
        provinsi,
        kabupaten,
        types,
        tahun,
        penerimamanfaat,
        tematik: daftarTematikPemanfaatan,
      })
    } catch (err) {
      console.error(err)

      return res
        .status(500)
        .json({ message: err.message || err || 'Unknown Error!' })
    }
  }

  static async getMasterInput(req, res) {
    try {
      // const unor = await ProUnor.findAll({
      //   attributes: ['id', 'kode', 'nama', 'id_program'],
      // })
      // const uker = await ProUker.findAll({
      //   attributes: ['id', 'kode', 'nama', 'id_kegiatan'],
      // })
      const satker = await ProSatker.findAll({
        attributes: ['id', 'kode', 'nama', 'id_program'],
      })
      // const program = await ProProgram.findAll({
      //   attributes: ['id', 'kode', 'nama'],
      // })
      // const kegiatan = await ProKegiatan.findAll({
      //   attributes: ['id', 'kode', 'nama', 'id_program', 'tipe'],
      // })
      // const type = await ProType.findAll({
      //   attributes: ['id', 'kode', 'nama'],
      // })
      const output = await ProOutput.findAll({
        attributes: ['id', 'kode', 'nama', 'id_kegiatan'],
      })
      // const suboutput = await ProSubOutput.findAll({
      //   attributes: ['id', 'kode', 'nama', 'id_output'],
      // })

      // const provinsi = await Provinsi.findAll({
      //   attributes: ['id', 'nama', 'latitude', 'longitude', 'zoom'],
      // })
      // const kabupaten = await City.findAll({
      //   attributes: [
      //     'id',
      //     'nama',
      //     'ProvinsiId',
      //     'latitude',
      //     'longitude',
      //     'zoom',
      //   ],
      // })
      // const kecamatan = await Kecamatan.findAll({
      //   attributes: ['id', 'nama', 'CityId'],
      // })
      // const desa = await Desa.findAll({
      //   attributes: ['id', 'nama', 'KecamatanId'],
      // })

      const penerimaManfaat = await ProTargetGroup.findAll({
        attributes: ['id', 'tipe', 'kode'],
      })

      const majorProjectPemanfaatan =
        await MasterMajorProjectPemanfaatan.findAll({
          attributes: ['id', 'nama', 'kode'],
        })

      // const asosiasi = await ProAsosiasi.findAll({
      //   attributes: ['id', 'nama'],
      // })

      // const asosiasi = [{ id: 1, nama: 'Koperasi' }]

      return res.status(200).json({
        // unor,
        // uker,
        satker,
        // program,
        // kegiatan,
        // type,
        output,
        // suboutput,

        // provinsi,
        // kabupaten,
        // kecamatan,
        // desa,

        penerimaManfaat,
        majorProjectPemanfaatan,
        // asosiasi,
      })
    } catch (err) {
      throw new ResponseError.BadRequest('Gagal mendapatkan data master input')
    }
  }

  static async findById(id, withSerahTerimaIds) {
    const profile = await Profile.findByPk(id, {
      include: [
        { model: Provinsi },
        { model: City },
        { model: Kecamatan },
        { model: Desa },
        { model: ProKegiatan },
        { model: ProSatker },
        { model: ProOutput },
        { model: ProTargetGroup },
        { model: ProProgram },
        { model: ProUnor },
        { model: ProUker },
        { model: ProSubOutput },
        { model: ProType },
        { model: MasterKelompokPengusul, attributes: ['id', 'nama'] },
        { model: MasterTematikPemanfaatan, attributes: ['id', 'nama'] },
        {
          model: MasterMajorProjectPemanfaatan,
          attributes: ['id', 'kode', 'nama'],
        },
        {
          model: KegiatanOpor,
          include: [{ model: MasterKegiatanOPOR, attributes: ['id', 'nama'] }],
        },
        { model: MasterKondisiBangunan },
        { model: SerahTerimaComment },
      ],
    })

    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')

    let data = {
      profile,
    }

    if (withSerahTerimaIds) {
      const profiles = await Profile.findAll({
        attributes: ['id', 'serahTerimaPemanfaatan'],
        where: sequelize.literal(`serahTerimaPemanfaatan like '%${id}%'`),
      })

      const serahTerimaIds = profiles
        .filter((record) => {
          for (const pemanfaatanId of record.serahTerimaPemanfaatan) {
            if (parseInt(pemanfaatanId) === parseInt(id)) return true
          }

          return false
        })
        .map((record) => record.id)

      //serahterima unit
      const serahTerimaUnits = await SerahTerimaUnit.findAll({
        where: {
          PemanfaatanId: id,
        },
      })
      let sisaUnit = profile.jml_unit
      for (const serahTerimaUnit of serahTerimaUnits) {
        sisaUnit = sisaUnit - serahTerimaUnit.jumlahUnit
      }

      //no pemanfaatan
      let noPemanfaatan = `P ${id}`
      let noSta = ''
      if (serahTerimaIds.length > 0) {
        noSta += 'STA ' + serahTerimaIds.join('-')
      }
      noPemanfaatan += noSta != '' ? ' - ' + noSta : ''

      data = {
        ...data,
        serahTerimaIds,
        sisaUnit,
        noPemanfaatan,
      }
    }

    return data
  }

  static async getFilterDirektorat(req, res) {
    try {
      let tahun = await Profile.findAll({
        attributes: [sequelize.fn('DISTINCT', 'thn_bang'), 'thn_bang'],
        where: { thn_bang: { $not: null } },
        order: ['thn_bang'],
      })
      let provinsi = await Provinsi.findAll({
        attributes: ['id', 'nama'],
      })
      let kabupaten = await City.findAll({
        attributes: ['id', 'nama', 'ProvinsiId'],
      })

      let output = await ProOutput.findAll({
        attributes: ['id', 'nama'],
      })

      let penerimamanfaat = await PenerimaManfaat.findAll({
        attributes: ['id', 'tipe'],
        where: {
          // Data Penerima manfaat double
          // MBR
          // dan TNI
          id: { $notIn: [21, 15] },
        },
      })

      return res.status(200).json({
        message: 'success',
        provinsi,
        kabupaten,
        tahun: (tahun || []).map((e) => e.thn_bang),
        output,
        penerimamanfaat,
      })
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return res.status(500).json({ message })
    }
  }

  static async getAllProfileDirektorat(direktorat, req, res) {
    try {
      const dataDirektorat = this.switchDataDirektorat(direktorat)
      let {
        page,
        pageSize,
        provinsi,
        kabupaten,
        program,
        kegiatan,
        output,
        tahunBang,
        id_uker,
        uker,
      } = req.query

      let pages = 0
      let limit = parseInt(pageSize ? pageSize : 10)

      if (page) {
        pages = page
      } else {
        pages = 0
      }

      let condition = {}

      if (provinsi && provinsi !== 'undefined' && provinsi !== 'null') {
        condition.id_provinsi = provinsi
      } else {
        provinsi = null
      }

      if (kabupaten && kabupaten !== 'undefined' && kabupaten !== 'null') {
        condition.id_kabkota = kabupaten
      } else {
        kabupaten = null
      }

      if (kegiatan && kegiatan !== 'undefined' && kegiatan !== 'null') {
        condition.id_kegiatan = kegiatan
      } else {
        kegiatan = null
      }

      if (output && output !== 'undefined' && output !== 'null') {
        condition.id_output = output
      } else {
        output = null
      }

      if (tahunBang && tahunBang !== 'undefined' && tahunBang !== 'null') {
        condition.thn_bang = tahunBang
      } else {
        tahunBang = null
      }

      if (uker && uker !== 'undefined' && uker !== 'null') {
        condition.uker = uker
      } else {
        uker = null
      }

      if (id_uker && id_uker !== 'undefined' && id_uker !== 'null') {
        condition.id_uker = id_uker
      } else {
        id_uker = null
      }
      condition = {
        ...condition,
        ...dataDirektorat,
      }

      let profiles = await Profile.findAndCountAll({
        offset: (pages - 1) * limit,
        limit: limit,
        where: condition,
      })

      return res.status(200).json({
        message: 'success',
        profiles,
        currentPage: parseInt(pages),
        totalPage: Math.ceil(profiles.count / limit),
      })
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return res.status(500).json({ message })
    }
  }

  static async getProfileDetailDirektorat(direktorat, req, res) {
    try {
      const { id } = req.params
      const dataDirektorat = this.switchDataDirektorat(direktorat)

      const profile = await Profile.findByPk(id, {
        where: { ...dataDirektorat },
        include: [
          {
            model: Provinsi,
          },
          {
            model: City,
          },
          {
            model: Kecamatan,
          },
          {
            model: Desa,
          },
          {
            model: ProProgram,
          },
          {
            model: ProKegiatan,
          },
          {
            model: ProUnor,
          },
          {
            model: ProSatker,
          },
          {
            model: ProOutput,
          },
          {
            model: ProSubOutput,
          },
          {
            model: ProType,
          },
          {
            model: ProTargetGroup,
          },
        ],
      })

      return res.status(200).json({
        message: 'success',
        profile,
      })
    } catch (err) {
      let message = ''
      if (err.message) {
        message = err.message
      }
      console.error(err)
      return res.status(500).json({ message })
    }
  }

  static switchDataDirektorat(direktorat) {
    let dataDirektorat = {
      id_type: 9999,
      type: 'any',
    }

    switch (direktorat) {
      // RUSWA
      case 'ruswa':
        dataDirektorat = {
          id_type: 3,
          type: 'RUMAH SWADAYA',
        }
        break

      // RUSUN
      case 'rusun':
        dataDirektorat = {
          id_type: 1,
          type: 'RUMAH SUSUN',
        }
        break

      // RUSUS
      case 'rusus':
        dataDirektorat = {
          id_type: 2,
          type: 'RUMAH KHUSUS',
        }
        break

      case 'ruk':
        dataDirektorat = {
          id_type: 4,
          type: 'RUMAH UMUM DAN KOMERSIL',
        }
        break

      default:
        break
    }

    return dataDirektorat
  }

  static async validatePemanfaatan({
    id_program,
    id_kegiatan,
    id_type,

    // Umum
    id_tgt_hunian,
    jml_unit,
    thn_bang,
    MasterMajorProjectPemanfaatanId,
    id_provinsi,
    id_kabkota,
    alamat,
    latitude,
    longitude,

    // Aset
    stat_srh_trm,
    id_keterangan_serah_terima,
  }) {
    if (!id_program) throw 'Program belum diisi'
    if (!id_kegiatan) throw 'Kegiatan belum diisi'
    if (!id_type) throw 'Model Kegiatan belum diisi'

    // Umum
    if (!id_tgt_hunian) throw 'Penerima Manfaat belum diisi'
    if (!jml_unit) throw 'Jumlah Unit belum diisi'

    if (!thn_bang) throw 'Tahun Pembangunan belum diisi'
    if (parseInt(thn_bang) <= 0) throw 'Tahun Pembangunan tidak valid'
    if (parseInt(thn_bang) < 2020)
      throw 'Tidak dapat menambahkan data pemanfaatan dengan Tahun Pembangunan dibawah tahun 2020'

    // if (!MasterMajorProjectPemanfaatanId) throw 'Major Project belum diisi'
    if (!id_provinsi) throw 'Provinsi belum diisi'
    if (!id_kabkota) throw 'Kabupaten/Kota belum diisi'
    if (!alamat) throw 'Alamat belum diisi'
    if (!latitude) throw 'Latitude belum diisi'
    if (!longitude) throw 'Longitude belum diisi'

    // Aset

    if (id_type != 3) {
      // Ruswa tidak memiliki Aset
      if (!(parseInt(stat_srh_trm) === 0 || parseInt(stat_srh_trm) === 1))
        throw 'Status Serah Terima belum diisi'
      if (id_keterangan_serah_terima === null)
        throw 'Keterangan Serah Terima belum diisi'
    }
  }

  static async createPemanfaatanDirektorat(
    direktorat,
    req,
    res,
    userActive,
    accessTokenInternal
  ) {
    try {
      await this.validatePemanfaatan(req.body)
    } catch (error) {
      throw new ResponseError.BadRequest(error)
    }

    try {
      const formData = req.body
      const dataDirektorat = this.switchDataDirektorat(direktorat)

      let Usulan = null
      if (formData.UsulanId) {
        const record = await PemanfaatanUsulanService.getUsulanById(
          formData.UsulanId,
          accessTokenInternal
        )
        Usulan = {
          noUsulan: record?.noUsulan,
          noSurat: record?.noSurat,
        }
      }

      delete userActive.Role
      delete userActive.region
      delete userActive.active
      delete userActive.alamatInstansi
      delete userActive.isSSO
      delete userActive.isReset
      delete userActive.createdAt
      delete userActive.updatedAt

      const data = await Profile.create({
        ...formData,
        ...dataDirektorat,
        Usulan,
        UserId: userActive?.id,
        User: userActive,
      })

      // Save data serah terima
      data.serahTerimaPemanfaatan = [data.id]
      await data.save()

      // Save data tematik
      if (formData.TematikPemanfaatanId) {
        await ProfileTematikPemanfaatan.create({
          ProfileId: data.id,
          MasterTematikPemanfaatanId: formData.TematikPemanfaatanId,
        })
      }

      // Save data OPOR
      if (
        Array.isArray(formData.KegiatanOpor) &&
        formData.KegiatanOpor.length > 0
      ) {
        const newKegiatanOpor = formData.KegiatanOpor.map((record) => {
          return {
            ...record,
            ProfileId: data.id,
          }
        })
        await KegiatanOpor.bulkCreate(newKegiatanOpor)
      }

      return res.status(201).json({
        message: 'Berhasil menyimpan data pemanfaatan',
        data,
      })
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal membuat data pemanfaatan')
    }
  }

  static async updatePemanfaatanDirektorat(
    direktorat,
    req,
    res,
    accessTokenInternal
  ) {
    try {
      await this.validatePemanfaatan(req.body)
    } catch (error) {
      throw new ResponseError.BadRequest(error)
    }

    try {
      const formData = req.body
      const { id } = req.params
      const { id_type, type } = this.switchDataDirektorat(direktorat)

      let Usulan = null
      if (formData.UsulanId) {
        const record = await PemanfaatanUsulanService.getUsulanById(
          formData.UsulanId,
          accessTokenInternal
        )
        Usulan = {
          noUsulan: record?.noUsulan,
          noSurat: record?.noSurat,
        }
      }

      await Profile.update(
        {
          ...formData,
          id_type,
          type,
          Usulan,
        },
        {
          where: {
            id,
            // $or: [{ id_type }, { type }],
          },
        }
      )

      // Save data tematik
      if (formData.TematikPemanfaatanId) {
        await ProfileTematikPemanfaatan.destroy({
          where: { ProfileId: id },
        })
        await ProfileTematikPemanfaatan.create({
          ProfileId: id,
          MasterTematikPemanfaatanId: formData.TematikPemanfaatanId,
        })
      }

      // Save data OPOR
      if (
        Array.isArray(formData.KegiatanOpor) &&
        formData.KegiatanOpor.length > 0
      ) {
        const newKegiatanOpor = formData.KegiatanOpor.map((record) => {
          return {
            ...record,
            ProfileId: id,
          }
        })

        await KegiatanOpor.destroy({
          where: { ProfileId: id },
        })
        await KegiatanOpor.bulkCreate(newKegiatanOpor)
      }

      return res.status(200).json({
        message: 'Berhasil menyimpan data pemanfaatan',
      })
    } catch (err) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengubah data pemanfaatan')
    }
  }

  static async uploadDokumen(id, { nama, type, dokumen, keterangan }) {
    if (!nama) throw new ResponseError.BadRequest('Nama belum diisi')
    if (!type) throw new ResponseError.BadRequest('Type belum diisi')
    if (!dokumen) throw new ResponseError.BadRequest('Dokumen belum diisi')

    const profile = await Profile.findByPk(id)
    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')

    const dokumenSource = `${dokumen.destination}${dokumen.filename}`
    const s3key = `pemanfaatan/${type}/${dokumen.filename}`

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

    const dokumenData = {
      ...dokumen,
      nama,
      isS3: true,
      s3url: s3url,
      keterangan: keterangan ? keterangan : '',
    }

    if (type === 'st') {
      const dokumenST = [...profile.dokumenST]

      let index = -1
      for (const dok of dokumenST) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          removeS3File(s3key)
          dokumenST.splice(index, 1)
          break
        }
      }

      await profile.update({
        dokumenST: [...dokumenST, dokumenData],
      })
    } else if (type === 'opor') {
      const dokumenOPOR = [...profile.dokumenOPOR]

      let index = -1
      for (const dok of dokumenOPOR) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          removeS3File(s3key)
          dokumenOPOR.splice(index, 1)
          break
        }
      }

      await profile.update({
        dokumenOPOR: [...dokumenOPOR, dokumenData],
      })
    } else if (type === 'foto') {
      const foto = [...profile.foto]

      let index = -1
      for (const dok of foto) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          removeS3File(s3key)
          foto.splice(index, 1)
          break
        }
      }

      await profile.update({
        foto: [...foto, dokumenData],
      })
    } else if (type === 'video') {
      const video = [...profile.video]

      let index = -1
      for (const dok of video) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          removeS3File(s3key)
          video.splice(index, 1)
          break
        }
      }

      await profile.update({
        video: [...video, dokumenData],
      })
    }

    return profile
  }

  static async updateDokumenInfo(id, { nama, type, keterangan }) {
    if (!nama) throw new ResponseError.BadRequest('Nama belum diisi')
    if (!type) throw new ResponseError.BadRequest('Type belum diisi')
    if (!keterangan)
      throw new ResponseError.BadRequest('Keterangan belum diisi')

    const profile = await Profile.findByPk(id)
    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')

    let currentData
    let field

    switch (type) {
      case 'st':
        currentData = [...profile.dokumenST]
        field = 'dokumenST'
        break
      case 'opor':
        currentData = [...profile.dokumenOPOR]
        field = 'dokumenOPOR'
        break
      case 'foto':
        currentData = [...profile.foto]
        field = 'foto'
        break
      case 'video':
        currentData = [...profile.video]
        field = 'video'
    }

    const newData = []

    for (const dok of currentData) {
      if (dok.nama === nama) {
        dok.keterangan = keterangan
      }

      newData.push(dok)
    }

    profile[field] = newData

    await profile.save()

    return profile
  }

  static async updateStatus(id, { status }, userActive) {
    const profile = await Profile.findByPk(id)

    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')
    if (status === null || status === '')
      throw new ResponseError.BadRequest('Status belum diisi')

    const pemanfaatanStatus = status

    let pemanfaatanStatusData = profile.pemanfaatanStatusData
      ? { ...profile.pemanfaatanStatusData }
      : { adminDirektorat: {}, adminSSPP: {} }

    const RoleId = userActive?.RoleId
    const Role = userActive?.Role
    const DirektoratId = Role?.DirektoratId
    const Direktorat = Role?.Direktorat
    const instansi = userActive?.instansi

    delete userActive.Role
    delete userActive.region
    delete userActive.active
    delete userActive.alamatInstansi
    delete userActive.isSSO
    delete userActive.isReset
    delete userActive.createdAt
    delete userActive.updatedAt

    let text = ''

    switch (parseInt(pemanfaatanStatus)) {
      case 0:
        text = `Pemanfaatan dengan id ${id} ditolak oleh Direktorat ${instansi}`
        break
      case 1:
        text = `Pemanfaatan dengan id ${id} disetujui oleh Direktorat ${instansi}`
        break
      case 2:
        text = `Pemanfaatan dengan id ${id} ditolak oleh Admin SSPP`
        break
      case 3:
        text = `Pemanfaatan dengan id ${id} disetujui oleh Admin SSPP`
    }

    switch (parseInt(pemanfaatanStatus)) {
      case 0:
      case 1:
        const adminDirektorat = {
          ...userActive,
          updatedStatusAt: new Date(),
        }
        pemanfaatanStatusData = {
          ...pemanfaatanStatusData,
          adminDirektorat,
        }
        break
      case 2:
      case 3:
        const adminSSPP = {
          ...userActive,
          updatedStatusAt: new Date(),
        }
        pemanfaatanStatusData = {
          ...pemanfaatanStatusData,
          adminSSPP,
        }

        break
    }

    await profile.update({
      pemanfaatanStatus,
      pemanfaatanStatusData,
    })

    const bulkData = []

    // Pembuat pemanfaatan
    let UserId = profile?.UserId
    let User = profile?.User

    const UsulanId = profile?.UsulanId
    const Usulan = profile?.Usulan
    const type = 'pemanfaatan'
    const read = false
    const attribute = { id: profile?.id }

    // Jika data pembuat pemanfatan ada
    if (UserId) {
      bulkData.push({
        UserId,
        User,
        DirektoratId,
        Direktorat,
        // RoleId: profile?.User?.RoleId,
        // Role: null,
        RoleId,
        Role,
        UsulanId,
        Usulan,
        text,
        type,
        read,
        attribute,
      })
    }

    // Self
    UserId = userActive.id
    User = userActive

    bulkData.push({
      UserId,
      User,
      DirektoratId,
      Direktorat,
      RoleId,
      Role,
      UsulanId,
      Usulan,
      text,
      type,
      read,
      attribute,
    })

    // Jika status diupdate oleh Admin Direktorat
    if (
      userActive?.RoleId === 24 ||
      userActive?.RoleId === 25 ||
      userActive?.RoleId === 27 ||
      userActive?.RoleId === 28
    ) {
      // Kirim ke Admin SSPP
      UserId = 4383
      User = null
      bulkData.push({
        UserId,
        User,
        DirektoratId,
        Direktorat,
        RoleId,
        Role,
        UsulanId,
        Usulan,
        text,
        type,
        read,
        attribute,
      })
    }

    NotificationService.bulkCreate(bulkData)

    return {
      id: profile.id,
      pemanfaatanStatus: profile.pemanfaatanStatus,
      pemanfaatanStatusData: profile.pemanfaatanStatusData,
    }
  }

  static async updateStatusType(id, { status, type }) {
    const profile = await Profile.findByPk(id)
    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')

    await profile.update({
      serahTerimaStatus: status,
      serahTerimaType: type,
    })

    return profile
  }

  static async deleteAllOporPemanfaatan(ProfileId) {
    if (!ProfileId) throw new Error('Profile Id tidak ditemukan')
    const deletedKegiatanOPOR = []

    const data = await KegiatanOpor.findAll({
      where: { ProfileId },
    })

    deletedKegiatanOPOR.push(...data)
    await KegiatanOpor.destroy({
      where: { ProfileId },
    })

    return deletedKegiatanOPOR
  }

  static async hapusPemanfaatan(req, res) {
    try {
      const { id } = req.params
      const hasId = parseFloat(id) > 0
      const data = await Profile.findByPk(id)
      const tahunPembangunan = parseFloat(data.thn_bang) || 0

      if (!hasId) {
        return res.status(400).json({ message: 'Id user not provided!' })
      }

      if (tahunPembangunan < 2020) {
        return res
          .status(400)
          .json({ message: 'Tidak dapat menghapus data dibawah tahun 2020' })
      }

      // Delete Photos
      if (Array.isArray(data.foto) && data.foto.length > 0) {
        data.foto.forEach((foto) => {
          fs.unlink(foto.path, (err) => {
            if (err) {
              console.log(err)
              return
            }

            console.log('photo deleted successfully')
          })
        })
      }

      // Delete Videos
      if (Array.isArray(data.video) && data.video.length > 0) {
        data.video.forEach((video) => {
          fs.unlink(video.path, (err) => {
            if (err) {
              console.log(err)
              return
            }

            console.log('video deleted successfully')
          })
        })
      }

      // Delete Tematiks
      await ProfileTematikPemanfaatan.destroy({
        where: { ProfileId: id },
      })

      // Delete Kegiatan OPORs
      await this.deleteAllOporPemanfaatan(id)

      await data.destroy()

      return res.status(200).json({ message: 'success' })
    } catch (err) {
      console.error(err)
      return res
        .status(500)
        .json({ message: err.message || 'Internal server error' })
    }
  }

  static async deletePemanfaatanDirektorat(direktorat, req, res) {
    try {
      const { id } = req.params
      const { id_type, type } = this.switchDataDirektorat(direktorat)
      const data = await Profile.findOne({
        where: {
          id,
          $or: [{ id_type }, { type }],
        },
      })

      if (!data) {
        throw {
          status: 404,
          message: `Data dengan id ${id} tidak ditemukan atau telah dihapus.`,
        }
      }

      // delete foto
      if (data.foto) {
        data.foto.forEach((foto) => {
          //unlink
          fs.unlink(foto.path, function (err) {
            if (err) return console.log(err)
            console.log('file deleted successfully')
          })
        })
      }

      // delete video
      if (data.video) {
        data.video.forEach((video) => {
          //unlink
          fs.unlink(video.path, function (err) {
            if (err) return console.log(err)
            console.log('file deleted successfully')
          })
        })
      }

      await data.destroy()

      return res.status(200).json({
        message: 'data berhasil dihapus',
      })
    } catch (error) {
      console.error(error)
      let message = error || 'Internal server error'

      if (typeof error === 'object' && error.status) {
        return res.status(error.status).json(error)
      }

      if (error.message) {
        message = error.message
      }

      return res.status(500).json({ message })
    }
  }

  static async deleteDokumen(id, { nama, type }) {
    if (!nama) throw new ResponseError.BadRequest('Nama belum diisi')

    const profile = await Profile.findByPk(id)
    if (!profile) throw new ResponseError.NotFound('Profile tidak ditemukan')

    if (type === 'st') {
      const dokumenST = [...profile.dokumenST]

      let index = -1
      for (const dok of dokumenST) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          try {
            await removeS3File(s3key)
          } catch {
            throw new ResponseError.NotFound('Gagal menghapus file')
          }
          dokumenST.splice(index, 1)
          break
        }
      }

      profile.update({
        dokumenST,
      })
    } else if (type === 'opor') {
      const dokumenOPOR = [...profile.dokumenOPOR]

      let index = -1
      for (const dok of dokumenOPOR) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          try {
            await removeS3File(s3key)
          } catch {
            throw new ResponseError.NotFound('Gagal menghapus file')
          }
          dokumenOPOR.splice(index, 1)
          break
        }
      }

      profile.update({
        dokumenOPOR,
      })
    } else if (type === 'foto') {
      const foto = [...profile.foto]

      let index = -1
      for (const dok of foto) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          try {
            await removeS3File(s3key)
          } catch (error) {
            console.log('S3 Error:')
            console.log(error)
            throw new ResponseError.NotFound('Gagal menghapus file')
          }
          foto.splice(index, 1)
          break
        }
      }

      profile.update({
        foto,
      })
    } else if (type === 'video') {
      const video = [...profile.video]

      let index = -1
      for (const dok of video) {
        index++
        if (dok.nama === nama) {
          const s3key = `pemanfaatan/${type}/${dok.filename}`
          try {
            await removeS3File(s3key)
          } catch {
            throw new ResponseError.NotFound('Gagal menghapus file')
          }
          video.splice(index, 1)
          break
        }
      }

      profile.update({
        video,
      })
    }

    return profile
  }
}

export default PemanfaatanService
