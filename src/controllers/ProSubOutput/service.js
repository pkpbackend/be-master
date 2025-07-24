import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { ProSubOutput } = models

class ProSubOutputService {

  static async findById(id) {
    const data = await ProSubOutput.findByPk(id)
    if (!data) throw new ResponseError.NotFound('ProSubOutput tidak ditemukan')
    return data
  }
  
}

export default ProSubOutputService
