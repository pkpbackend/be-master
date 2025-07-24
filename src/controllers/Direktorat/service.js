import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { Direktorat } = models

class DirektoratService {

  static async findAll() {
    const data = await Direktorat.findAll()
    return data
  }

  static async findAllPaginate() {
    const data = await Direktorat.findAll()
    const total = await Direktorat.count()

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findById(id) {
    const data = await Direktorat.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Direktorat tidak ditemukan')
    return data
  }
}

export default DirektoratService
