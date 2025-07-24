import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { MasterTematik } = models

class MasterTematikService {
  
  static async findById(id) {
    const data = await MasterTematik.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Tematik tidak ditemukan')
    return data
  }

}

export default MasterTematikService
