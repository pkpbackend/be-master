import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { PenerimaManfaat } = models

class PenerimaManfaatService {
  static async findAll(req) {
    const { DirektoratId } = req.query
    let conditions = {}

    if (DirektoratId) {
      conditions = {
        ...conditions,
        DirektoratId,
      }
    }

    const data = await PenerimaManfaat.findAll({
      where: conditions,
    })
    const total = await PenerimaManfaat.count({
      where: conditions,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findById(id) {
    const data = await PenerimaManfaat.findByPk(id)
    if (!data)
      throw new ResponseError.NotFound('Penerima manfaat tidak ditemukan')
    return data
  }
}

export default PenerimaManfaatService
