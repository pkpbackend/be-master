import { Op } from 'sequelize'
import models from '../../database/models'

const { ProOutput, ProSubOutput } = models

class FilterService {

  static async findAllKro(filter) {
    const conditions = {}

    if (filter) {
      if (filter.nama) {
        conditions.nama = {
          [Op.like]: `%${filter.nama}%`,
        }
      }

      if (filter.id_kegiatan) {
        conditions.id_kegiatan = filter.id_kegiatan
      }
  
      if (filter.tipe) {
        conditions.tipe = filter.tipe
      }
    }

    const data = await ProOutput.findAll({
      where: {
        tipe: 'kro/ro',
        kode: {
          [Op.in]: ['CBB', 'RBB'],
        },
        ...conditions,
      }
    })

    return {
      message: 'success',
      data,
    }
  }

  static async findAllRo(filter) {
    const conditions = {}
    
    if (filter) {
      if (filter.kode) {
        conditions.kode = filter.kode
      }

      if (filter.nama) {
        conditions.nama = {
          [Op.like]: `%${filter.nama}%`,
        }
      }

      if (filter.id_output) {
        conditions.id_output = filter.id_output
      }
  
      if (filter.tipe) {
        conditions.tipe = filter.tipe
      }
    }

    const data = await ProSubOutput.findAll({
      where: {
        tipe: 'kro/ro',
        ...conditions,
      }
    })
    
    return {
      message: 'success',
      data,
    }
  }

}

export default FilterService
