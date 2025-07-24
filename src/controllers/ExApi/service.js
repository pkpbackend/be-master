import ResponseError from '../../modules/Error'
import models from '../../database/models'

const {
  Profile,
  Provinsi,
  City,
  Kecamatan,
  Desa,
  ProKegiatan,
  ProBalai,
  ProSatker,
} = models

class ExApiService {
  static getCommonFilter(query) {
    let { page, pageSize, provinsi, kabupaten, kecamatan, tahun } = query

    pageSize = pageSize
      ? !isNaN(parseInt(pageSize))
        ? parseInt(pageSize)
        : 10
      : null

    page = parseInt(page)
    if (isNaN(page)) {
      page = 0
    }
    let offset = pageSize * page

    let commonCondition = {}

    //alternate condition
    if (tahun) {
      commonCondition = {
        ...commonCondition,
        thn_bang: tahun,
      }
    }

    if (provinsi) {
      commonCondition = {
        ...commonCondition,
        id_provinsi: provinsi,
      }
    }

    if (kabupaten) {
      if (!provinsi)
        throw new Error(
          'kabupaten memerlukan id provinsi, provinsi wajib diisi...'
        )

      commonCondition = {
        ...commonCondition,
        id_kabkota: kabupaten,
      }
    }

    if (kecamatan) {
      if (!provinsi || !kabupaten)
        throw new Error(
          'kecamatan memerlukan id provinsi dan id kabupaten, provinsi dan kabupaten wajib diisi...'
        )

      commonCondition = {
        ...commonCondition,
        id_kecamatan: kecamatan,
      }
    }

    return {
      pageSize,
      offset,
      commonCondition,
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
          model: ProKegiatan,
        },
        {
          model: ProBalai,
        },
        {
          model: ProSatker,
        },
      ],
    }
  }

  static async profileTransformNew(type, profile) {
    let transformedProfile = null
    let data = profile.dataValues

    //common transform

    //provinsi
    let Provinsi = {
      id: null,
      nama: null,
    }
    if (data.Provinsi) {
      Provinsi = {
        id: data.Provinsi.id,
        nama: data.Provinsi.nama,
      }
    } else {
      Provinsi = {
        id: data.id_provinsi,
        nama: data.provinsi,
      }
    }

    //kabupaten
    let Kabupaten = {
      id: null,
      nama: null,
    }
    if (data.City) {
      Kabupaten = {
        id: data.City.id,
        nama: data.City.nama,
      }
    } else {
      Kabupaten = {
        id: data.id_kabkota,
        nama: data.kabkota,
      }
    }

    //kecamatan
    let Kecamatan = {
      id: null,
      nama: null,
    }
    if (data.Kecamatan) {
      Kecamatan = {
        id: data.Kecamatan.id,
        nama: data.Kecamatan.nama,
      }
    } else {
      Kecamatan = {
        id: data.id_kecamatan,
        nama: data.kecamatan,
      }
    }

    //desa
    let Desa = {
      id: null,
      nama: null,
    }
    if (data.Desa) {
      Desa = {
        id: data.Desa.id,
        nama: data.Desa.nama,
      }
    } else {
      Desa = {
        id: data.id_desa,
        nama: data.desa,
      }
    }

    //kegiatan
    let Kegiatan = {
      id: null,
      nama: null,
    }
    if (data.ProKegiatan) {
      Kegiatan = {
        id: data.ProKegiatan.id,
        nama: data.ProKegiatan.nama,
      }
    } else {
      Kegiatan = {
        id: data.id_kegiatan,
        nama: data.kegiatan,
      }
    }

    //balai
    let Balai = {
      id: null,
      nama: null,
    }
    if (data.ProBalai) {
      Balai = {
        id: data.ProBalai.id,
        nama: data.ProBalai.nama,
      }
    } else {
      Balai = {
        id: data.id_balai,
        nama: data.balai,
      }
    }

    //satker
    let Satker = {
      id: null,
      nama: null,
    }
    if (data.ProSatker) {
      Satker = {
        id: data.ProSatker.id,
        nama: data.ProSatker.nama,
      }
    } else {
      Satker = {
        id: data.id_satker,
        nama: data.satker,
      }
    }

    transformedProfile = {
      lastUpdate: data.updatedAt,

      alamat: data.alamat,

      id_kegiatan: Kegiatan.id,
      kegiatan: Kegiatan.nama,

      id_provinsi: Provinsi.id,
      provinsi: Provinsi.nama,

      id_kabkota: Kabupaten.id,
      kabkota: Kabupaten.nama,

      id_kecamatan: Kecamatan.id,
      kecamatan: Kecamatan.nama,

      id_desa: Desa.id,
      desa: Desa.nama,

      id_balai: Balai.id,
      balai: Balai.nama,

      id_satker: Satker.id,
      satker: Satker.nama,

      latitude: data.latitude,
      longitude: data.longitude,
    }

    //tranf column
    if (type === 'ruk') {
      transformedProfile = {
        ...transformedProfile,
        tot_biaya: data.tot_biaya,
        jml_unit: data.jml_unit,
        tipe_unit: data.tipe_unit,

        nm_perumahan: data.nm_perumahan,
        nm_pengembang: data.nm_pengembang,

        thn_selesaibang: data.thn_selesaibang,
      }
    } else if (type === 'rusun') {
      transformedProfile = {
        ...transformedProfile,
        tot_biaya: data.tot_biaya,
        jml_unit: data.jml_unit,
        jml_lantai: data.jml_lantai,
        jml_unit_huni: data.jml_unit_huni,

        nm_kontraktor: data.nm_kontraktor,
        nm_perumahan: data.nm_perumahan,

        stat_srh_trm: data.stat_srh_trm,
        thn_serah_aset: data.thn_serah_aset,

        tower: data.tower,
        tgt_hunian: data.tgt_hunian,
        thn_selesaibang: data.thn_selesaibang,
        tipe_unit: data.tipe_unit,
      }
    } else if (type === 'rusus') {
      transformedProfile = {
        ...transformedProfile,
        tot_biaya: data.tot_biaya,
        jml_unit: data.jml_unit,
        jml_unit_huni: data.jml_unit_huni,
        tipe_unit: data.tipe_unit,

        nm_perumahan: data.nm_perumahan,
        nm_kontraktor: data.nm_kontraktor,

        stat_srh_trm: data.stat_srh_trm,
        thn_serah_aset: data.thn_serah_aset,

        thn_selesaibang: data.thn_selesaibang,
        sumb_dana: data.sumb_dana,
        tgt_hunian: data.tgt_hunian,
      }
    } else if (type === 'swadaya') {
      transformedProfile = {
        ...transformedProfile,
        tot_biaya: data.tot_biaya,
        jml_unit: data.jml_unit,
        thn_selesaibang: data.thn_selesaibang,
      }
    }

    //relasi
    // transformedProfile = {
    //   ...transformedProfile,
    //   TargetGroup: await profile.getProTargetGroup({
    //     attributes: ['tipe'],
    //   }),
    // }

    return transformedProfile
  }

  static calculateStatistics(container, data) {
    if (!container) {
      container = {
        total_unit: 0,
        total_biaya: 0,
      }
    }

    container.total_unit += Number(data.jml_unit) || 0
    container.total_biaya += Number(data.tot_biaya) || 0

    return container
  }

  static async findPemanfaatanMaster(data) {
    return { test: 'pemanfaatan master' }
  }

  static async findPemanfaatanRusunawa(data) {
    try {
      let { pageSize, offset, commonCondition, include } =
        ExApiService.getCommonFilter(data)

      let datas = await Profile.findAndCountAll({
        limit: pageSize,
        offset,
        where: {
          ...commonCondition,
          id_type: 1,
        },
        include,
      })

      let xData = []
      let statistics = null
      for (const data of datas.rows) {
        statistics = ExApiService.calculateStatistics(statistics, data)
        xData.push(await ExApiService.profileTransformNew('rusun', data))
      }

      return { data: xData, total: datas.count, statistics }
    } catch (err) {
      console.error(err)
    }
  }

  static async findPemanfaatanRusus(data) {
    try {
      let { pageSize, offset, commonCondition, include } =
        ExApiService.getCommonFilter(data)

      let datas = await Profile.findAndCountAll({
        limit: pageSize,
        offset,
        where: {
          ...commonCondition,
          id_type: 2,
        },
        include,
      })

      let xData = []
      let statistics = null
      for (const data of datas.rows) {
        statistics = ExApiService.calculateStatistics(statistics, data)
        xData.push(await ExApiService.profileTransformNew('rusus', data))
      }

      return { data: xData, total: datas.count, statistics }
    } catch (err) {
      console.error(err)
    }
  }

  static async findPemanfaatanBsps(data) {
    try {
      let { pageSize, offset, commonCondition, include } =
        ExApiService.getCommonFilter(data)

      let datas = await Profile.findAndCountAll({
        limit: pageSize,
        offset,
        where: {
          ...commonCondition,
          id_type: 3,
        },
        include,
      })

      let xData = []
      let statistics = null
      for (const data of datas.rows) {
        statistics = ExApiService.calculateStatistics(statistics, data)
        xData.push(await ExApiService.profileTransformNew('swadaya', data))
      }

      return { data: xData, total: datas.count, statistics }
    } catch (err) {
      console.error(err)
    }
  }

  static async findPemanfaatanPsu(data) {
    try {
      let { pageSize, offset, commonCondition, include } =
        ExApiService.getCommonFilter(data)

      let datas = await Profile.findAndCountAll({
        limit: pageSize,
        offset,
        where: {
          ...commonCondition,
          id_type: 4,
        },
        include,
      })

      let xData = []
      let statistics = null

      for (const data of datas.rows) {
        statistics = ExApiService.calculateStatistics(statistics, data)
        xData.push(await ExApiService.profileTransformNew('ruk', data))
      }

      return { data: xData, total: datas.count, statistics }
    } catch (err) {
      console.error(err)
    }
  }

  static async findDataRTLH(data) {
    return { test: 'data rtlh', data }
  }

  static async findDataRTLHSulteng(data) {
    return { test: 'data rtlh sulteng', data }
  }

  static async findERTLH(data) {
    return { test: 'data ertlh', data }
  }
}

export default ExApiService
