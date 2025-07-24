import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { MasterKegiatanOPOR } = models

class MasterKegiatanOporService {
  static async findAll() {
    const data = await MasterKegiatanOPOR.findAll()
    return data
  }

  static async findById(id) {
    const data = await MasterKegiatanOPOR.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Kegiatan tidak ditemukan')
    return data
  }
}

export default MasterKegiatanOporService
