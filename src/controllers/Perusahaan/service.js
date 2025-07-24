import { Op } from 'sequelize'
import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { Perusahaan, Provinsi, City, Kecamatan, Desa } = models

class PerusahaanService {
  static async findAll(query) {
    let conditions = {}

    if (query.name) {
      conditions = {
        ...conditions,
        name: { [Op.like]: `%${query.name}%` }
      }
    }

    if (query.asosiasi) {
      conditions = {
        ...conditions,
        asosiasi: { [Op.like]: `%${query.asosiasi}%` }
      }
    }

    if (query.alamat) {
      conditions = {
        ...conditions,
        alamat: { [Op.like]: `%${query.alamat}%` }
      }
    }

    if (query.kodePos) {
      conditions = {
        ...conditions,
        kodePos: { [Op.like]: `%${query.kodePos}%` }
      }
    }

    if (query.rtRw) {
      conditions = {
        ...conditions,
        rtRw: { [Op.like]: `%${query.rtRw}%` }
      }
    }
    
    if (query.namaDirektur) {
      conditions = {
        ...conditions,
        namaDirektur: { [Op.like]: `%${query.namaDirektur}%` }
      }
    }
    
    if (query.telpKantor) {
      conditions = {
        ...conditions,
        telpKantor: { [Op.like]: `%${query.telpKantor}%` }
      }
    }

    if (query.telpDirektur) {
      conditions = {
        ...conditions,
        telpDirektur: { [Op.like]: `%${query.telpDirektur}%` }
      }
    }
    
    if (query.telpPenanggungJawab) {
      conditions = {
        ...conditions,
        telpPenanggungJawab: { [Op.like]: `%${query.telpPenanggungJawab}%` }
      }
    }
    
    if (query.email) {
      conditions = {
        ...conditions,
        email: { [Op.like]: `%${query.email}%` }
      }
    }

    if (query.website) {
      conditions = {
        ...conditions,
        website: { [Op.like]: `%${query.website}%` }
      }
    }

    if (query.npwp) {
      conditions = {
        ...conditions,
        npwp: { [Op.like]: `%${query.npwp}%` }
      }
    }

    if (query.ProvinsiId) {
      conditions = {
        ...conditions,
        ProvinsiId: query.ProvinsiId,
      }
    }

    if (query.CityId) {
      conditions = {
        ...conditions,
        CityId: query.CityId,
      }
    }
    
    if (query.KecamatanId) {
      conditions = {
        ...conditions,
        KecamatanId: query.KecamatanId,
      }
    }

    if (query.DesaId) {
      conditions = {
        ...conditions,
        DesaId: query.DesaId,
      }
    }
    
    const data = await Perusahaan.findAll({
      where: conditions,
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
      ],
    })
    const total = await Perusahaan.count({
      where: conditions,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findById(id) {
    const data = await Perusahaan.findOne({
      where: {
        id,
      },
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
      ],
    })
    if (!data) throw new ResponseError.NotFound('Perusahaan tidak ditemukan')
    return data
  }

  static async create({
    name,
    asosiasi,
    alamat,
    kodePos,
    rtRw,
    namaDirektur,
    telpKantor,
    telpDirektur,
    telpPenanggungJawab,
    email,
    website,
    npwp,
    ProvinsiId,
    CityId,
    DesaId,
    KecamatanId,
  }) {
    if (!name) throw new ResponseError.BadRequest('Nama belum diisi')
    if (!asosiasi) throw new ResponseError.BadRequest('Asosiasi belum diisi')
    if (!namaDirektur) throw new ResponseError.BadRequest('Nama Direktur belum diisi')
    if (!telpDirektur) throw new ResponseError.BadRequest('Telp Direktur belum diisi')
    if (!telpPenanggungJawab) throw new ResponseError.BadRequest('Telp Penanggung Jawab belum diisi')
    if (!email) throw new ResponseError.BadRequest('Email belum diisi')
    if (!ProvinsiId) throw new ResponseError.BadRequest('Provinsi belum diisi')
    if (!CityId) throw new ResponseError.BadRequest('Kabupaten/Kota belum diisi')
    if (!DesaId) throw new ResponseError.BadRequest('Desa belum diisi')
    if (!KecamatanId) throw new ResponseError.BadRequest('Kecamatan belum diisi')

    const newPerusahaan = await Perusahaan.create({
      name,
      asosiasi,
      alamat,
      kodePos,
      rtRw,
      namaDirektur,
      telpKantor,
      telpDirektur,
      telpPenanggungJawab,
      email,
      website,
      npwp,
      ProvinsiId,
      CityId,
      DesaId,
      KecamatanId,
    })

    return {
      message: 'Perusahaan berhasil dibuat',
      data: newPerusahaan,
    }
  }
}

export default PerusahaanService
