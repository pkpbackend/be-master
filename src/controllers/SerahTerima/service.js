import { exec } from 'child_process'
import fs from 'fs'
import ejs from 'ejs'
import moment from 'moment'
import excel from 'exceljs'
import PemanfaatanUsulanService from '../../controllers/PemanfaatanUsulan/service'
import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { mkApiPengusulan } from '../../helpers/internalApi'
import {
  STATUS_SERAH_TERIMA_ALIH_STATUS,
  STATUS_SERAH_TERIMA_HIBAH,
  TYPE_SERAH_TERIMA,
} from '../../constants/SerahTerima'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'
import { removeS3File, uploadFileToS3 } from '../../helpers/s3Helper'
import _ from 'lodash'
import { WILAYAH } from '../../constants/Wilayah'
import NotificationService from '../../controllers/Notification/service'
import Sequelize, { Op } from 'sequelize'
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
  MasterDokumenSerahTerima,
  MasterDokumen,
  SerahTerimaUnit,
} = models

class SerahTerimaService {

  static async importSpreadsheetFile(spreadsheetFile) {
    if (!spreadsheetFile) {
      throw new ResponseError.BadRequest('File belum diisi')
    }

    const formatDate = (excelDate) => {
      if (!excelDate) return null 
      if (typeof excelDate !== 'number') return null 

      const baseDate = new Date(1899, 11, 30)
      const milliseconds = excelDate * 24 * 60 * 60 * 1000
      const objectDate = new Date(baseDate.getTime() + milliseconds - baseDate.getTimezoneOffset() * 60 * 1000)
      return `${objectDate.getFullYear()}-${objectDate.getMonth() + 1}-${objectDate.getDate()}`
    }

    const workbook = new excel.Workbook()
    await workbook.xlsx.readFile(spreadsheetFile.path)

    const worksheet = workbook.getWorksheet('Data Serah Terima')

    let i = 2
    let isEor = false

    const bulkData = []

    while (!isEor) {
      i++

      const id_program = 1
      const id_kegiatan = 5
      const id_type = 2
      const stat_srh_trm = 0
      const serahTerimaStatus = 0
      const type = 'RUMAH KHUSUS'

      // const capaianPembangunan = worksheet.getCell(`D${i}`).value?.trim() || null
      const jenisSerahTerima = worksheet.getCell(`A${i}`).value?.trim().toLowerCase() || null
      const kategoriBarang = worksheet.getCell(`B${i}`).value?.trim().toLowerCase() || null
      const penerimaPenyediaan = worksheet.getCell(`C${i}`).value?.trim() || null
      const penerimaManfaat = worksheet.getCell(`D${i}`).value?.trim() || null
      const tipeUnit = worksheet.getCell(`E${i}`).value || null
      const jumlahUnit = worksheet.getCell(`F${i}`).value || null
      const tahunAnggaranPembangunan = worksheet.getCell(`G${i}`).value || null
      const tahunSelesaiPembangunan = worksheet.getCell(`H${i}`).value || null
      const jenisKontrak = worksheet.getCell(`I${i}`).value?.trim() || null
      const satuanKerjaPelaksana = worksheet.getCell(`J${i}`).value?.trim() || null
      const namaPaket = worksheet.getCell(`K${i}`).value?.trim() || null
      const nup = worksheet.getCell(`L${i}`).value || null
      const noDipa = worksheet.getCell(`M${i}`).value || null
      const tanggalDipa = worksheet.getCell(`N${i}`).value || null
      const provinsi = worksheet.getCell(`O${i}`).value?.trim().toUpperCase() || null
      const kabupaten = worksheet.getCell(`P${i}`).value?.trim().toUpperCase() || null
      const alamat = worksheet.getCell(`Q${i}`).value?.trim() || null
      const latitude = worksheet.getCell(`R${i}`).value || null
      const longitude = worksheet.getCell(`S${i}`).value || null

      const fisik_nilaiKontrak = worksheet.getCell(`T${i}`).value || null
      const fisik_nilaiBMN = worksheet.getCell(`U${i}`).value || null
      const fisik_nomorKontrak = worksheet.getCell(`V${i}`).value || null
      const fisik_tanggalKontrakPembangunan = worksheet.getCell(`W${i}`).value || null
      const fisik_namaKontraktorPembangunan = worksheet.getCell(`X${i}`).value || null

      const psu_nilaiKontrak = worksheet.getCell(`Y${i}`).value || null
      const psu_nilaiBMN = worksheet.getCell(`Z${i}`).value || null
      const psu_nomorKontrak = worksheet.getCell(`AA${i}`).value || null
      const psu_tanggalKontrakPembangunan = worksheet.getCell(`AB${i}`).value || null
      const psu_namaKontraktorPembangunan = worksheet.getCell(`AC${i}`).value || null

      const mebel_nilaiKontrak = worksheet.getCell(`AD${i}`).value || null
      const mebel_nilaiBMN = worksheet.getCell(`AE${i}`).value || null
      const mebel_nomorKontrak = worksheet.getCell(`AF${i}`).value || null
      const mebel_tanggalKontrakPembangunan = worksheet.getCell(`AG${i}`).value || null
      const mebel_namaKontraktorPembangunan = worksheet.getCell(`AH${i}`).value || null

      const perencana_nilaiKontrak = worksheet.getCell(`AI${i}`).value || null
      const perencana_nilaiBMN = worksheet.getCell(`AJ${i}`).value || null
      const perencana_nomorKontrak = worksheet.getCell(`AK${i}`).value || null
      const perencana_tanggalKontrakPembangunan = worksheet.getCell(`AL${i}`).value || null
      const perencana_namaKontraktorPembangunan = worksheet.getCell(`AM${i}`).value || null

      const pengawas_nilaiKontrak = worksheet.getCell(`AN${i}`).value || null
      const pengawas_nilaiBMN = worksheet.getCell(`AO${i}`).value || null
      const pengawas_nomorKontrak = worksheet.getCell(`AP${i}`).value || null
      const pengawas_tanggalKontrakPembangunan = worksheet.getCell(`AQ${i}`).value || null
      const pengawas_namaKontraktorPembangunan = worksheet.getCell(`AR${i}`).value || null

      const sumb_dana = worksheet.getCell(`AS${i}`).value?.trim() || null

      let direktorat = null

      switch(id_type) {
        case 1:
          direktorat = 'rusun'
          break
        case 2:
          direktorat = 'rusus'
          break
        case 3:
          direktorat = 'swadaya'
          break
        case 4:
          direktorat = 'ruk'
      }

      const dataDirektorat = this.switchDataDirektorat(direktorat)

      let serahTerimaPemanfaatan = null

      // if (capaianPembangunan) {
      //   const xCapaianPembangunan = capaianPembangunan.split(' ')
      //   if (xCapaianPembangunan[0] === 'P' && xCapaianPembangunan.length >= 2) {
      //     serahTerimaPemanfaatan = [parseInt(xCapaianPembangunan[1])]
      //   }
      // }

      const serahTerimaType = jenisSerahTerima

      let KelompokPengusulId = null

      if (penerimaPenyediaan) {
        const kelompokPengusul = await MasterKelompokPengusul.findOne({
          where: {
            nama: penerimaPenyediaan,
          },
        })

        if (kelompokPengusul) {
          KelompokPengusulId = kelompokPengusul.id
        }
      }

      let id_tgt_hunian = null

      if (penerimaManfaat) {
        const _penerimaManfaat = await PenerimaManfaat.findOne({
          where: {
            tipe: penerimaManfaat,
          },
        })

        if (_penerimaManfaat) {
          id_tgt_hunian = _penerimaManfaat.id
        }
      }

      const tipe_unit = tipeUnit
      const jmlStaUnit = jumlahUnit ? parseInt(jumlahUnit) : null
      const thn_bang = tahunAnggaranPembangunan
      const thn_selesaibang = tahunSelesaiPembangunan

      let myc = null
      switch (jenisKontrak) {
        case 'Single Year':
          myc = 0
          break
        case 'Multi Year':
          myc = 1
      }

      let id_satker = null

      if (satuanKerjaPelaksana) {
        const proSatker = await ProSatker.findOne({
          where: {
            nama: satuanKerjaPelaksana,
          },
        })

        if (proSatker) {
          id_satker = proSatker.id
        }
      }

      let tglDipa = null

      if (tanggalDipa instanceof Date) {
        tglDipa = `${tanggalDipa.getFullYear()}-${tanggalDipa.getMonth() + 1}-${tanggalDipa.getDate()}`
      }
      else if (typeof tanggalDipa === 'number') {
        tglDipa = formatDate(tanggalDipa)
      }

      let id_provinsi = null

      if (provinsi) {
        const _provinsi = await Provinsi.findOne({
          where: {
            nama: provinsi,
          },
        })

        if (_provinsi) {
          id_provinsi = _provinsi.id
        }
      }

      let id_kabkota = null

      if (kabupaten) {
        const _kabupaten = await City.findOne({
          where: {
            nama: kabupaten,
          },
        })

        if (_kabupaten) {
          id_kabkota = _kabupaten.id
        }
      }

      if (!serahTerimaType) {
        throw new ResponseError.BadRequest('Ada Jenis Serah Terima yg kosong atau format pengisiannya tidak valid')
      }

      if (!kategoriBarang) {
        throw new ResponseError.BadRequest('Ada Kategori Barang yg kosong atau format pengisiannya tidak valid')
      }

      if (!KelompokPengusulId) {
        throw new ResponseError.BadRequest('Ada Penerima Penyediaan yg kosong atau format pengisiannya tidak valid')
      }

      if (!id_tgt_hunian) {
        throw new ResponseError.BadRequest('Ada Penerima Manfaat yg kosong atau format pengisiannya tidak valid')
      }

      if (!thn_bang) {
        throw new ResponseError.BadRequest('Ada Tahun Anggaran Pembangunan yg kosong atau format pengisiannya tidak valid')
      }

      if (!thn_selesaibang) {
        throw new ResponseError.BadRequest('Ada Tahun Selesai Pembangunan yg kosong atau format pengisiannya tidak valid')
      }

      if (myc === null) {
        throw new ResponseError.BadRequest('Ada Jenis Kontrak yg kosong atau format pengisiannya tidak valid')
      }

      if (!id_satker) {
        throw new ResponseError.BadRequest('Ada Satuan Kerja Pelaksana yg kosong atau format pengisiannya tidak valid')
      }

      // if (!namaPaket) {
      //   throw new ResponseError.BadRequest('Ada Nama Paket yg kosong atau format pengisiannya tidak valid')
      // }

      // if (!nup) {
      //   throw new ResponseError.BadRequest('Ada NUP yg kosong atau format pengisiannya tidak valid')
      // }

      // if (!noDipa) {
      //   throw new ResponseError.BadRequest('Ada Nomor Dipa yg kosong atau format pengisiannya tidak valid')
      // }

      // if (!tglDipa) {
      //   throw new ResponseError.BadRequest('Ada Tanggal Dipa yg kosong atau format pengisiannya tidak valid')
      // }

      // const fisik_nilaiKontrak = worksheet.getCell(`W${i}`).value || null
      // const fisik_nilaiBMN = worksheet.getCell(`X${i}`).value || null
      // const fisik_nomorKontrak = worksheet.getCell(`Y${i}`).value || null
      // const fisik_tanggalKontrakPembangunan = worksheet.getCell(`Z${i}`).value || null
      // const fisik_jenisKontrak = null
      // const fisik_namaKontraktorPembangunan = worksheet.getCell(`AA${i}`).value || null

      const kontrakFisikBangunanRumah = [{
        nilaiKontrak: fisik_nilaiKontrak,
        nilaiBMN: fisik_nilaiBMN,
        nomorKontrak: fisik_nomorKontrak,
        tanggalKontrakPembangunan: formatDate(fisik_tanggalKontrakPembangunan),
        namaKontraktorPembangunan: fisik_namaKontraktorPembangunan,
      }]

      const kontrakPsu = [{
        nilaiKontrak: psu_nilaiKontrak,
        nilaiBMN: psu_nilaiBMN,
        nomorKontrak: psu_nomorKontrak,
        tanggalKontrakPembangunan: formatDate(psu_tanggalKontrakPembangunan),
        namaKontraktorPembangunan: psu_namaKontraktorPembangunan,
      }]

      const kontrakMebel = [{
        nilaiKontrak: mebel_nilaiKontrak,
        nilaiBMN: mebel_nilaiBMN,
        nomorKontrak: mebel_nomorKontrak,
        tanggalKontrakPembangunan: formatDate(mebel_tanggalKontrakPembangunan),
        namaKontraktorPembangunan: mebel_namaKontraktorPembangunan,
      }]

      const kontrakPerencana = [{
        nilaiKontrak: perencana_nilaiKontrak,
        nilaiBMN: perencana_nilaiBMN,
        nomorKontrak: perencana_nomorKontrak,
        tanggalKontrakPembangunan: formatDate(perencana_tanggalKontrakPembangunan),
        namaKontraktorPembangunan: perencana_namaKontraktorPembangunan,
      }]

      const kontrakPengawas = [{
        nilaiKontrak: pengawas_nilaiKontrak,
        nilaiBMN: pengawas_nilaiBMN,
        nomorKontrak: pengawas_nomorKontrak,
        tanggalKontrakPembangunan: formatDate(pengawas_tanggalKontrakPembangunan),
        namaKontraktorPembangunan: pengawas_namaKontraktorPembangunan,
      }]

      console.log("id_program", id_program)
      console.log("id_kegiatan", id_kegiatan)
      console.log("id_type", id_type)
      console.log("serahTerimaPemanfaatan", serahTerimaPemanfaatan)
      console.log("serahTerimaType", serahTerimaType)
      console.log("kategoriBarang", kategoriBarang)
      console.log("KelompokPengusulId", KelompokPengusulId)
      console.log("id_tgt_hunian", id_tgt_hunian)
      console.log("tipe_unit", tipe_unit)
      console.log("jmlStaUnit", jmlStaUnit)
      console.log("thn_bang", thn_bang)
      console.log("thn_selesaibang", thn_selesaibang)
      console.log("myc", myc)
      console.log("id_satker", id_satker)
      console.log("namaPaket", namaPaket)
      console.log("nup", nup)
      console.log("noDipa", noDipa)
      console.log("tglDipa", tglDipa)
      console.log("id_provinsi", id_provinsi)
      console.log("id_kabkota", id_kabkota)
      console.log("alamat", alamat)
      console.log("latitude", latitude)
      console.log("longitude", longitude)
      console.log("---------------------------------------------------")
      console.log("kontrakFisikBangunanRumah", kontrakFisikBangunanRumah)
      console.log("kontrakPsu", kontrakPsu)
      console.log("kontrakMebel", kontrakMebel)
      console.log("kontrakPerencana", kontrakPerencana)
      console.log("kontrakPengawas", kontrakPengawas)
      console.log("---------------------------------------------------")

      bulkData.push({
        ...dataDirektorat,
        id_program,
        id_kegiatan,
        id_type,
        stat_srh_trm,
        serahTerimaStatus,
        type,
        sumb_dana,
        serahTerimaPemanfaatan,
        serahTerimaType,
        kategoriBarang,
        KelompokPengusulId,
        id_tgt_hunian,
        tipe_unit,
        jmlStaUnit,
        thn_bang,
        thn_selesaibang,
        myc,
        id_satker,
        namaPaket,
        nup,
        noDipa,
        tglDipa,
        id_provinsi,
        id_kabkota,
        alamat,
        latitude,
        longitude,
        kontrakFisikBangunanRumah,
        kontrakPsu,
        kontrakMebel,
        kontrakPerencana,
        kontrakPengawas,
      })

      // Jenis Serah Terima adalah penanda EOR
      isEor = !(worksheet.getCell(`B${i + 1}`).value)
    }

    const data = await Profile.bulkCreate(bulkData)
    // const data = 'ok'

    fs.unlinkSync(spreadsheetFile.path)

    return { message: "success" }
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

  static async generateNoSta(PemanfaatanId) {
    const serahTerimaUnit = await SerahTerimaUnit.findAll({
      where: {
        PemanfaatanId,
      },
    })
    return `STA ${PemanfaatanId} - ` + serahTerimaUnit.length
  }

  static async setSerahTerimaUnit(SerahTerimaId, PemanfaatanId, jumlahUnit) {
    const serahTerimaUnit = await SerahTerimaUnit.findOne({
      where: {
        SerahTerimaId,
        PemanfaatanId,
      },
    })

    if (!serahTerimaUnit) {
      await SerahTerimaUnit.create({
        SerahTerimaId,
        PemanfaatanId,
        jumlahUnit,
      })
      return serahTerimaUnit
    }

    await serahTerimaUnit.update({
      jumlahUnit,
    })
    return serahTerimaUnit
  }

  static async createSerahTerimaDirektorat(
    direktorat,
    req,
    res,
    accessTokenInternal
  ) {
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

      const data = await Profile.create({
        ...formData,
        ...dataDirektorat,
        Usulan,
      })

      if (
        formData.serahTerimaPemanfaatan &&
        formData.serahTerimaPemanfaatan.length > 0
      ) {
        for (const item of formData.serahTerimaPemanfaatan) {
          if (formData.jmlStaUnit) {
            await this.setSerahTerimaUnit(data.id, item, formData.jmlStaUnit)
          }
        }
      }

      //generate noSta : STA {PemanfaatanId} - {sequence}
      if (
        formData.serahTerimaPemanfaatan &&
        formData.serahTerimaPemanfaatan.length > 0
      ) {
        const noSta = await this.generateNoSta(
          formData.serahTerimaPemanfaatan[0]
        )
        await Profile.update(
          {
            noSta,
          },
          {
            where: {
              id: data.id,
            },
          }
        )
      }

      return res.status(201).json({
        message: 'Berhasil menyimpan data serah terima',
        data,
      })
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal membuat data serah terima')
    }
  }

  static async updateSerahTerimaDirektorat(
    direktorat,
    req,
    res,
    accessTokenInternal
  ) {
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

      if (
        formData.serahTerimaPemanfaatan &&
        formData.serahTerimaPemanfaatan.length > 0
      ) {
        for (const item of formData.serahTerimaPemanfaatan) {
          if (formData.jmlStaUnit) {
            await this.setSerahTerimaUnit(id, item, formData.jmlStaUnit)
          }
        }
      }

      //generate noSta : STA {PemanfaatanId} - {sequence}
      if (
        formData.serahTerimaPemanfaatan &&
        formData.serahTerimaPemanfaatan.length > 0
      ) {
        const noSta = await this.generateNoSta(
          formData.serahTerimaPemanfaatan[0]
        )
        await Profile.update(
          {
            noSta,
          },
          {
            where: {
              id,
            },
          }
        )
      }

      return res.status(200).json({
        message: 'Berhasil menyimpan data pemanfaatan',
      })
    } catch (err) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal mengubah data pemanfaatan')
    }
  }

  static async createComment({ message, SerahTerimaId, UserId, User }) {
    if (!message) throw new ResponseError.BadRequest('Message belum diisi')
    if (!SerahTerimaId)
      throw new ResponseError.BadRequest('SerahTerimaId wajib diisi')

    const serahTerima = await Profile.findByPk(SerahTerimaId)
    if (!serahTerima)
      throw new ResponseError.NotFound('Serah terima tidak ditemukan')

    const data = await SerahTerimaComment.create({
      message,
      SerahTerimaId,
      UserId,
      User,
    })

    return data
  }

  static async getDokumenSerahTerima(params, accessTokenInternal) {
    const apiPengusulanWithAuth = mkApiPengusulan(accessTokenInternal)

    const response = await apiPengusulanWithAuth.get('/dokumen/serahterima', {
      params,
    })

    return response.data
  }

  static async downloadPdf(SerahTerimaId, accessTokenInternal) {
    const st = await Profile.findByPk(SerahTerimaId, {
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

    if (!st) throw new ResponseError.NotFound('Serah terima tidak ditemukan')

    const masterDokumen = await MasterDokumenSerahTerima.findAll({
      where: {
        serahTerimaType: st.serahTerimaType.replace(' ', ''),
      },
      include: [{ model: MasterDokumen }],
      order: [['sequence', 'asc']],
    })

    const dokumenSerahTerima = await this.getDokumenSerahTerima(
      {
        filtered: JSON.stringify([
          {
            id: 'ModelId',
            value: SerahTerimaId,
          },
        ]),
      },
      accessTokenInternal
    )

    const stMasterDokumen = masterDokumen
      .map((d) => {
        let file = null
        let activity = null
        for (const doc of dokumenSerahTerima) {
          if (doc.MasterDokumenId === d?.MasterDokumen?.id) {
            file = doc.file
            activity = doc.activity
            break
          }
        }
        return {
          nama: d?.MasterDokumen?.nama,
          id: d?.MasterDokumen?.id,
          model: d?.MasterDokumen?.model,
          type: d?.serahTerimaType,
          file,
          activity,
        }
      })
      .filter((d) => {
        return d.model !== 'SerahTerima-Lainnya'
      })

    const content = {
      st: {
        ...st.dataValues,
        tglDipa: st.dataValues.tglDipa
          ? moment(st.dataValues.tglDipa).format('DD-MM-YYYY')
          : null,
      },
      stMasterDokumen,
      lengkap: ['Tidak Sesuai', 'Sesuai', 'Belum Ditentukan'],
    }

    //fs remove dir
    fs.rmSync(`./tmp/serahterima`, { recursive: true, force: true })
    fs.mkdirSync(`./tmp/serahterima`, { recursive: true })

    // set your html as the pages content
    const html = fs.readFileSync(`./views/serahterima.ejs`, 'utf8')
    const renderHtml = ejs.render(html, content)

    const source = `./tmp/serahterima/${SerahTerimaId}.html`
    const output = `./tmp/serahterima/${SerahTerimaId}.pdf`

    //write to file
    fs.writeFileSync(source, renderHtml)

    exec(`wkhtmltopdf ${source} ${output}`)

    await new Promise((r) => setTimeout(r, 5000))

    return { file: output }
  }

  static transformDashboardStatus(tipe, statuses, data, provinsis) {
    let result = []
    let total = 0
    let totalUnit = 0
    let totalPerolehan = 0
    const provs = data
      .map((d) => {
        return {
          id_provinsi: d.id_provinsi,
          status: d.serahTerimaStatus,
        }
      })
      .filter(
        (d, i, self) =>
          self.findIndex(
            (t) =>
              t.id_provinsi === d.id_provinsi && statuses.includes(t.status)
          ) === i
      )
    provinsis = provinsis
      .map((p) => {
        return {
          id: p.id,
          nama: p.nama,
        }
      })
      .filter((p) => provs.some((d) => d.id_provinsi == p.id))
    // .map((p) => p.nama)

    for (const s of statuses) {
      const dataByStatus = data.filter((d) => {
        return d.serahTerimaStatus === s
      })
      const statusCount = dataByStatus.length
      const unitCount =
        dataByStatus.length > 0
          ? dataByStatus.map((d) => {
            return d.jmlStaUnit != null ? d.jmlStaUnit : 0
          })
          : 0
      const perolehanCount =
        dataByStatus.length > 0
          ? dataByStatus.map((d) => {
            return d.tot_biaya != null ? d.tot_biaya : 0
          })
          : 0

      //unique array provinsi
      const provDataByStatus = Array.from(
        new Set(
          dataByStatus
            .filter((d) => {
              return d.id_provinsi
            })
            .map((d) => d.id_provinsi)
        )
      )

      total += statusCount
      totalUnit += parseInt(unitCount)
      totalPerolehan += parseInt(perolehanCount)

      // merge pengumpulan berkas
      if ([1, 2].includes(s)) {
        let searchIndex = _.find(
          result,
          (r) => r.value === 'pengumpulan berkas'
        )
        if (searchIndex) {
          searchIndex.total += statusCount
          searchIndex.totalUnit += parseInt(unitCount)
          searchIndex.totalPerolehan += parseInt(perolehanCount)
          searchIndex.totalProvinsi = provinsis.length
          searchIndex.provinsis = provinsis.map((p) => p.nama)
        }
        continue
      }

      // merge selesai into penghapusan aset
      if (
        s ===
        (tipe === 'alih status'
          ? STATUS_SERAH_TERIMA_ALIH_STATUS.indexOf('selesai')
          : STATUS_SERAH_TERIMA_HIBAH.indexOf('selesai'))
      ) {
        let searchIndex = _.find(
          result,
          (r) =>
            r.status ===
            (tipe === 'alih status'
              ? STATUS_SERAH_TERIMA_ALIH_STATUS.indexOf('penghapusan aset bmn')
              : STATUS_SERAH_TERIMA_HIBAH.indexOf('penghapusan aset bmn'))
        )
        if (searchIndex) {
          searchIndex.total += statusCount
          searchIndex.totalUnit += parseInt(unitCount)
          searchIndex.totalPerolehan += parseInt(perolehanCount)
          searchIndex.totalProvinsi = provinsis.length
          searchIndex.provinsis = provinsis.map((p) => p.nama)
        }
        continue
      }

      result.push({
        status: s === 0 ? [0, 1, 2] : s, // pengumpulan berkas return status [0,1,2]
        value:
          tipe === 'alih status'
            ? STATUS_SERAH_TERIMA_ALIH_STATUS[s]
            : STATUS_SERAH_TERIMA_HIBAH[s],
        total: statusCount,
        totalUnit: parseInt(unitCount),
        totalPerolehan: parseInt(perolehanCount),
        totalProvinsi: provinsis.filter((p) =>
          provDataByStatus.some((d) => d == p.id)
        ).length,
        provinsis: provinsis
          .filter((p) => provDataByStatus.some((d) => d == p.id))
          .map((p) => p.nama),
      })
    }

    return {
      result,
      total,
      totalUnit,
      totalPerolehan,
      totalProvinsi: provinsis.length,
      provinsis: provinsis.map((p) => p.nama),
    }
  }

  static transformDashboardStatusAll(
    hibahStatuses,
    alihStatusStatuses,
    data,
    provinsis
  ) {
    let result = []
    let total = 0
    let totalUnit = 0
    let totalPerolehan = 0
    const provs = data
      .map((d) => {
        return {
          id_provinsi: d.id_provinsi,
          serahTerimaType: d.serahTerimaType,
          serahTerimaStatus: d.serahTerimaStatus,
        }
      })
      .filter(
        (d, i, self) =>
          self.findIndex(
            (t) =>
              t.id_provinsi === d.id_provinsi &&
              ((t.serahTerimaType == 'hibah' &&
                hibahStatuses.includes(t.serahTerimaStatus)) ||
                (t.serahTerimaType == 'alih status' &&
                  alihStatusStatuses.includes(t.serahTerimaStatus)))
          ) === i
      )
    const totalProvinsi = provs.length
    provinsis = provinsis
      .map((p) => {
        return {
          id: p.id,
          nama: p.nama,
        }
      })
      .filter((p) => provs.some((d) => d.id_provinsi == p.id))
    // .map((p) => p.nama)

    let tmpHibahStatuses = []
    let tmpAlihStatusStatuses = []

    for (const d of data) {
      if (
        (d.serahTerimaType === 'hibah' &&
          hibahStatuses.includes(d.serahTerimaStatus)) ||
        (d.serahTerimaType === 'alih status' &&
          alihStatusStatuses.includes(d.serahTerimaStatus))
      ) {
        let searchIndex = _.find(
          result,
          (r) =>
            r.value ===
            (d.serahTerimaType === 'alih status'
              ? STATUS_SERAH_TERIMA_ALIH_STATUS[d.serahTerimaStatus]
              : STATUS_SERAH_TERIMA_HIBAH[d.serahTerimaStatus])
        )
        if (searchIndex) {
          searchIndex.total += 1
          searchIndex.totalUnit += d.jmlStaUnit || 0
          searchIndex.totalPerolehan += d.tot_biaya || 0

          //add provinsi name to searchIndex
          const provName = provinsis
            .filter((p) => p.id == d.id_provinsi)
            .map((p) => p.nama)[0]
          if (!searchIndex.provinsis.includes(provName)) {
            searchIndex.provinsis.push(provName)
            searchIndex.totalProvinsi += 1
          }
        } else {
          result.push({
            status: [0, 1, 2].includes(d.serahTerimaStatus)
              ? [0, 1, 2]
              : d.serahTerimaStatus,
            value:
              d.serahTerimaType === 'alih status'
                ? STATUS_SERAH_TERIMA_ALIH_STATUS[d.serahTerimaStatus]
                : STATUS_SERAH_TERIMA_HIBAH[d.serahTerimaStatus],
            total: 1,
            totalUnit: d.jmlStaUnit || 0,
            totalPerolehan: d.tot_biaya || 0,
            //add provinsi name
            totalProvinsi: 1,
            provinsis: provinsis
              .filter((p) => p.id == d.id_provinsi)
              .map((p) => p.nama),
          })
        }
        total += 1
        totalUnit += d.jmlStaUnit || 0
        totalPerolehan += d.tot_biaya || 0
      }

      // merge selesai into penghapusan aset
      if (
        d.serahTerimaStatus ===
        (d.serahTerimaType === 'alih status'
          ? STATUS_SERAH_TERIMA_ALIH_STATUS.indexOf('selesai')
          : STATUS_SERAH_TERIMA_HIBAH.indexOf('selesai'))
      ) {
        let searchIndex = _.find(
          result,
          (r) =>
            r.status ===
            (d.serahTerimaType === 'alih status'
              ? STATUS_SERAH_TERIMA_ALIH_STATUS.indexOf('penghapusan aset bmn')
              : STATUS_SERAH_TERIMA_HIBAH.indexOf('penghapusan aset bmn'))
        )
        if (searchIndex) {
          searchIndex.total += 1
          searchIndex.totalUnit += d.jmlStaUnit || 0
          searchIndex.totalPerolehan += d.tot_biaya || 0

          //add provinsi name to searchIndex
          const provName = provinsis
            .filter((p) => p.id == d.id_provinsi)
            .map((p) => p.nama)[0]
          if (!searchIndex.provinsis.includes(provName)) {
            searchIndex.provinsis.push(provName)
            searchIndex.totalProvinsi += 1
          }
        }
      }

      if (
        d.serahTerimaType === 'alih status' &&
        !tmpAlihStatusStatuses.includes(d.serahTerimaStatus)
      ) {
        tmpAlihStatusStatuses.push(d.serahTerimaStatus)
      }
      if (
        d.serahTerimaType === 'hibah' &&
        !tmpHibahStatuses.includes(d.serahTerimaStatus)
      ) {
        tmpHibahStatuses.push(d.serahTerimaStatus)
      }
    }

    let diff = hibahStatuses.filter((v) => !tmpHibahStatuses.includes(v))
    for (const s of diff) {
      if (s === STATUS_SERAH_TERIMA_HIBAH.indexOf('selesai')) continue
      let searchIndex = _.find(
        result,
        (r) => r.value === STATUS_SERAH_TERIMA_HIBAH[s]
      )
      if (!searchIndex) {
        result.push({
          status: s === 0 ? [0, 1, 2] : s, // pengumpulan berkas return status [0,1,2]
          value: STATUS_SERAH_TERIMA_HIBAH[s],
          total: 0,
          totalUnit: 0,
          totalPerolehan: 0,
          totalProvinsi: 0,
          provinsis: [],
        })
      }
    }

    diff = alihStatusStatuses.filter((v) => !tmpAlihStatusStatuses.includes(v))
    for (const s of diff) {
      if (s === STATUS_SERAH_TERIMA_ALIH_STATUS.indexOf('selesai')) continue
      let searchIndex = _.find(
        result,
        (r) => r.value === STATUS_SERAH_TERIMA_ALIH_STATUS[s]
      )
      if (!searchIndex) {
        result.push({
          status: s === 0 ? [0, 1, 2] : s, // pengumpulan berkas return status [0,1,2]
          value: STATUS_SERAH_TERIMA_ALIH_STATUS[s],
          total: 0,
          totalUnit: 0,
          totalPerolehan: 0,
          totalProvinsi: 0,
          provinsis: [],
        })
      }
    }

    return {
      result,
      total,
      totalUnit,
      totalPerolehan,
      totalProvinsi,
      provinsis: provinsis.map((p) => p.nama),
    }
  }

  static async getSerahTerimaDashboard({
    start_year,
    end_year,
    provinsiid,
    tipe,
    wilayah,
    provinsiids,
  }) {
    let findWhere = { serahTerimaType: { [Op.not]: null } }
    if (tipe) {
      if (!TYPE_SERAH_TERIMA.includes(tipe))
        throw new ResponseError.BadRequest('jenis serah terima tidak valid')

      findWhere = { serahTerimaType: tipe }
    }

    if (provinsiid) {
      findWhere = {
        ...findWhere,
        id_provinsi: provinsiid,
      }
    }

    if (start_year && end_year) {
      findWhere = {
        ...findWhere,
        thn_bang: {
          [Op.between]: [start_year, end_year],
        },
      }
    } else {
      if (start_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.gte]: start_year,
          },
        }
      }

      if (end_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.lte]: end_year,
          },
        }
      }
    }

    if (wilayah) {
      const provs = await Provinsi.findAll({
        where: {
          kodeWilayah: wilayah,
        },
      })
      const provIds = provs.map((p) => p.id)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    if (provinsiids) {
      const provIds = JSON.parse(provinsiids)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    const data = await Profile.findAll({
      where: findWhere,
    })

    const dataByProvinsi = await Profile.findAll({
      where: findWhere,
      attributes: ['id_provinsi'],
      group: ['id_provinsi'],
    })

    const provinsis = await Provinsi.findAll()
    const allProvinsis = provinsis
      .map((d) => {
        return {
          id: d.id,
          nama: d.nama,
        }
      })
      .filter((d) => dataByProvinsi.map((d) => d.id_provinsi).includes(d.id))
      .map((d) => d.nama)

    // get all serah terima type (alih status and hibah)
    if (!tipe) {
      const belumDiproses = this.transformDashboardStatusAll(
        [0, 1, 2],
        [0, 1, 2],
        data,
        provinsis
      )

      const prosesDiusulkan = this.transformDashboardStatusAll(
        [3],
        [3],
        data,
        provinsis
      )

      const prosesSta = this.transformDashboardStatusAll(
        [4, 5, 6, 7],
        [4, 5, 6, 7, 8, 9, 10],
        data,
        provinsis
      )

      const penghapusanAset = this.transformDashboardStatusAll(
        [8, 9],
        [11, 12],
        data,
        provinsis
      )

      return {
        belumDiproses,
        prosesDiusulkan,
        prosesSta,
        penghapusanAset,
        totalAll: data.length,
        totalAllUnit:
          belumDiproses.totalUnit +
          prosesDiusulkan.totalUnit +
          prosesSta.totalUnit +
          penghapusanAset.totalUnit,
        totalAllPerolehan:
          belumDiproses.totalPerolehan +
          prosesDiusulkan.totalPerolehan +
          prosesSta.totalPerolehan +
          penghapusanAset.totalPerolehan,
        totalAllProvinsi: allProvinsis.length,
        allProvinsis,
      }
    }

    const belumDiproses = this.transformDashboardStatus(
      tipe,
      [0, 1, 2],
      data,
      provinsis
    )

    const prosesDiusulkan = this.transformDashboardStatus(
      tipe,
      [3],
      data,
      provinsis
    )

    const prosesSta = this.transformDashboardStatus(
      tipe,
      tipe === 'alih status' ? [4, 5, 6, 7, 8, 9, 10] : [4, 5, 6, 7],
      data,
      provinsis
    )

    const penghapusanAset = this.transformDashboardStatus(
      tipe,
      tipe === 'alih status' ? [11, 12] : [8, 9],
      data,
      provinsis
    )

    return {
      belumDiproses,
      prosesDiusulkan,
      prosesSta,
      penghapusanAset,
      totalAll: data.length,
      totalAllUnit:
        belumDiproses.totalUnit +
        prosesDiusulkan.totalUnit +
        prosesSta.totalUnit +
        penghapusanAset.totalUnit,
      totalAllPerolehan:
        belumDiproses.totalPerolehan +
        prosesDiusulkan.totalPerolehan +
        prosesSta.totalPerolehan +
        penghapusanAset.totalPerolehan,
      totalAllProvinsi: allProvinsis.length,
      allProvinsis,
    }
  }

  static async getSerahTerimaGroupByYear(req) {
    const { start_year, end_year, provinsiid, tipe, wilayah, provinsiids } =
      req.query

    let findWhere = { thn_bang: { [Op.not]: null } }
    if (tipe) {
      if (!TYPE_SERAH_TERIMA.includes(tipe))
        throw new ResponseError.BadRequest('jenis serah terima tidak valid')

      findWhere = { ...findWhere, serahTerimaType: tipe }
    } else {
      findWhere = { ...findWhere, serahTerimaType: { [Op.not]: null } }
    }

    if (provinsiid) {
      findWhere = {
        ...findWhere,
        id_provinsi: provinsiid,
      }
    }

    if (start_year && end_year) {
      findWhere = {
        ...findWhere,
        thn_bang: {
          [Op.between]: [start_year, end_year],
        },
      }
    } else {
      if (start_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.gte]: start_year,
          },
        }
      }

      if (end_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.lte]: end_year,
          },
        }
      }
    }

    if (wilayah) {
      const provs = await Provinsi.findAll({
        where: {
          kodeWilayah: wilayah,
        },
      })
      const provIds = provs.map((p) => p.id)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    if (provinsiids) {
      const provIds = JSON.parse(provinsiids)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    let data = await Profile.findAll({
      where: findWhere,
      attributes: [
        'thn_bang',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.fn('SUM', Sequelize.col('jmlStaUnit')), 'totalUnit'],
        [Sequelize.fn('SUM', Sequelize.col('tot_biaya')), 'totalPerolehan'],
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('id_provinsi')),
            'id_provinsi'
          ),
          'totalProvinsi',
        ],
        [
          Sequelize.fn('GROUP_CONCAT', Sequelize.col('id_provinsi')),
          'provinsis',
        ],
      ],
      group: ['thn_bang'],
      order: [['thn_bang', 'ASC']],
    })

    if (data.length > 0) {
      const provs = await Provinsi.findAll()

      data = data.map((d) => {
        const provinsisFiltered = Array.from(
          new Set(d.dataValues.provinsis.split(','))
        )

        return {
          year: parseInt(d.thn_bang),
          totalLokasi: d.dataValues.total,
          totalUnit:
            d.dataValues.totalUnit != null
              ? parseInt(d.dataValues.totalUnit)
              : 0,
          totalPerolehan:
            d.dataValues.totalPerolehan != null
              ? parseInt(d.dataValues.totalPerolehan)
              : 0,
          totalProvinsi:
            d.dataValues.totalProvinsi != null
              ? parseInt(d.dataValues.totalProvinsi)
              : 0,
          provinsis: provs
            .map((p) => {
              if (provinsisFiltered.includes(p.id.toString())) {
                return p.dataValues.nama
              }
            })
            .filter((p) => p != null),
        }
      })
    }

    return { message: 'success', data }
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
        {
          model: MasterKelompokPengusul,
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
          serahTerimaType: item.serahTerimaType
            ?.split(' ')
            .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(' '),
          penerimaPenyediaan: `${item?.MasterKelompokPengusul?.id} - ${item?.MasterKelompokPengusul?.nama}`,
          jenisKontrak: item.myc === '0' ? 'Single Year' : 'Multi Year',
          satuanKerjaPelaksana: `${item?.ProSatker?.kode} - ${item?.ProSatker?.nama}`,
          serahTerimaPemanfaatan:
            item.serahTerimaPemanfaatan != null &&
              item.serahTerimaPemanfaatan.length > 0
              ? item.serahTerimaPemanfaatan
                .map((s) => {
                  return `- ${s}`
                })
                .join('\n')
              : '',
          wilayah: `${item.provinsi ||
            (item.Provinsi && item.Provinsi.kodeWilayah) ||
            null
            } - ${WILAYAH.find(
              (w) => w.kodeWilayah === item.Provinsi.kodeWilayah
            )?.value.join(', ')}`,
        }
      })

      const excelCols = [
        {
          header: 'Nomor Pemafaatan',
          key: 'serahTerimaPemanfaatan',
          width: 15,
        },
        { header: 'Wilayah', key: 'wilayah', width: 10 },
        {
          header: 'Satuan Kerja Pelaksana',
          key: 'satuanKerjaPelaksana',
          width: 20,
        },
        { header: 'Provinsi', key: 'provinsi', width: 20 },
        { header: 'Kab/Kota', key: 'kabkota', width: 20 },
        { header: 'Alamat', key: 'alamat', width: 20 },
        { header: 'Nama Paket', key: 'namaPaket', width: 20 },
        { header: 'Tahun Pembangunan', key: 'thn_bang', width: 20 },
        { header: 'Jenis Serah Terima', key: 'serahTerimaType', width: 20 },
        { header: 'NUP / No. Barang', key: 'nup', width: 20 },
        { header: 'Kategori Barang', key: 'kategoriBarang', width: 20 },
        { header: 'Jumlah Unit', key: 'jml_unit', width: 20 },
        { header: 'Tipe Unit', key: 'tipe_unit', width: 20 },
        { header: 'Penerima Penyediaan', key: 'penerimaPenyediaan', width: 20 },
        { header: 'Penerima Manfaat', key: 'tgt_hunian', width: 20 },
        { header: 'Nilai Perolehan', key: 'tot_biaya', width: 20 },
      ]

      const worksheet = workbook.addWorksheet('Daftar Serah Terima')
      worksheet.columns = excelCols

      worksheet.addRows(extractedDaftarPemanfaatan)

      worksheet.eachRow((col, index) => {
        if (index === 1) {
          col.font = { bold: true }
        }

        col.alignment = { wrapText: true }
      })
    } catch (error) {
      console.log(error)
      throw new ResponseError.BadRequest('Gagal generate excel')
    }

    const fileName = `serahterima-${Math.random()}.xlsx`
    const fileSource = `./tmp/${fileName}`

    try {
      await workbook.xlsx.writeFile(fileSource)
    } catch {
      throw new ResponseError.BadRequest('Gagal membuat file')
    }

    let s3url
    const s3key = 'laporan/serahterima.xlsx'

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

  static async sendNotifKelengkapan(req, res) {
    const { serahTerimaId, value } = req.body
    const { profile } = res.locals

    if (!serahTerimaId)
      throw new ResponseError.BadRequest('ID Serah Terima tidak ditemukan')

    const serahTerima = await Profile.findOne({
      where: { id: serahTerimaId },
    })
    if (!serahTerima)
      throw new ResponseError.BadRequest('Serah terima tidak ditemukan')

    const roleids = [12, 37, 8, 24]
    await NotificationService.notifyAdminDirektorat(
      roleids,
      {
        text: `Serah Terima Aset dengan ID ${serahTerima.noSta} ${value}`,
        type: 'serahterima',
        attribute: serahTerima,
      },
      {
        updatedById: profile.id,
        ProvinsiId: serahTerima.id_provinsi,
      }
    )

    return { message: 'success' }
  }

  static async getDashboardMap({
    start_year,
    end_year,
    provinsiid,
    tipe,
    wilayah,
    provinsiids,
  }) {
    let findWhere = { serahTerimaType: { [Op.not]: null } }

    if (tipe) {
      findWhere = {
        ...findWhere,
        serahTerimaType: tipe,
      }
    }

    if (provinsiid) {
      findWhere = {
        ...findWhere,
        id_provinsi: provinsiid,
      }
      // provWhere = { id: provinsiid }
    }

    if (start_year && end_year) {
      findWhere = {
        ...findWhere,
        thn_bang: {
          [Op.between]: [start_year, end_year],
        },
      }
    } else {
      if (start_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.gte]: start_year,
          },
        }
      }

      if (end_year) {
        findWhere = {
          ...findWhere,
          thn_bang: {
            [Op.lte]: end_year,
          },
        }
      }
    }

    if (wilayah) {
      const provs = await Provinsi.findAll({
        where: {
          kodeWilayah: wilayah,
        },
      })
      const provIds = provs.map((p) => p.id)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    if (provinsiids) {
      const provIds = JSON.parse(provinsiids)
      findWhere = {
        ...findWhere,
        id_provinsi: {
          [Op.in]: provIds,
        },
      }
    }

    const data = await Profile.findAll({
      where: findWhere,
      include: [
        {
          model: Provinsi,
          attributes: ['id', 'nama', 'latitude', 'longitude'],
        },
      ],
      attributes: [
        'id',
        'id_provinsi',
        'latitude',
        'longitude',
        'serahTerimaType',
      ],
    })

    return { data, message: 'success' }
  }
}

export default SerahTerimaService
