import { EXAPI_RTLH_KEY } from '../../config/env'
import ResponseError from '../../modules/Error'
import models from '../../database/models'
import { mkExapiRTLH } from '../../helpers/externalApi'
import PluginSqlizeQuery from '../../modules/SqlizeQuery/PluginSqlizeQuery'

const { Provinsi, City, Kecamatan, Desa } = models

class WilayahService {
  static async findAllProvinsi(req) {
    const { includeCount, ...queryFind } = PluginSqlizeQuery.generate(
      req.query,
      Provinsi,
      []
    )

    const data = await Provinsi.findAll({
      ...queryFind,
      logging: console.log,
    })
    const total = await Provinsi.count({
      where: queryFind.where,
      include: includeCount,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findOneProvinsi(req) {
    const { id } = req.params
    const data = await Provinsi.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Provinsi tidak ditemukan')
    return data
  }

  static async findAllCity(req) {
    const { includeCount, order, ...queryFind } = PluginSqlizeQuery.generate(
      req.query,
      City,
      []
    )

    const data = await City.findAll({
      ...queryFind,
    })
    const total = await City.count({
      where: queryFind.where,
      include: includeCount,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findOneCity(req) {
    const { id } = req.params
    const data = await City.findByPk(id)
    if (!data) throw new ResponseError.NotFound('City tidak ditemukan')
    return data
  }

  static async findAllKecamatan(req) {
    const { includeCount, ...queryFind } = PluginSqlizeQuery.generate(
      req.query,
      Kecamatan,
      []
    )

    const data = await Kecamatan.findAll({
      ...queryFind,
    })
    const total = await Kecamatan.count({
      where: queryFind.where,
      include: includeCount,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findOneKecamatan(req) {
    const { id } = req.params
    const data = await Kecamatan.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Kecamatan tidak ditemukan')
    return data
  }

  static async findAllDesa(req) {
    const { includeCount, ...queryFind } = PluginSqlizeQuery.generate(
      req.query,
      Desa,
      []
    )

    const data = await Desa.findAll({
      ...queryFind,
    })
    const total = await Desa.count({
      where: queryFind.where,
      include: includeCount,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findOneDesa(req) {
    const { id } = req.params
    const data = await Desa.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Desa tidak ditemukan')
    return data
  }

  static async findRTLH(id) {
    const exapiRtlh = mkExapiRTLH()

    const response = await exapiRtlh.get('/ertlh_rtlh_jumlah.php', {
      params: {
        api_key: EXAPI_RTLH_KEY,
        kdwilayah: id,
      },
    })
    const { data } = response

    if (!(Array.isArray(data) && data.length > 0)) {
      throw new ResponseError.NotFound('RTLH tidak ditemukan')
    }

    const rtlh = data[0]

    if (!rtlh.nmprovinsi) {
      throw new ResponseError.NotFound('RTLH tidak ditemukan')
    }

    return {
      message: 'success',
      data: rtlh,
    }
  }
}

export default WilayahService
