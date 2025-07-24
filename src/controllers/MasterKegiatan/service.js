import ResponseError from '../../modules/Error'
import models from '../../database/models'

const { MasterKegiatan } = models

class MasterKegiatanService {
  static async findAll(query) {
    let conditions = {}

    if (query.DirektoratId) {
      conditions = {
        ...conditions,
        DirektoratId: query.DirektoratId,
      }
    }

    const data = await MasterKegiatan.findAll({
      where: conditions,
    })
    const total = await MasterKegiatan.count({
      where: conditions,
    })

    return {
      message: 'success',
      data,
      total,
    }
  }

  static async findById(id) {
    const data = await MasterKegiatan.findByPk(id)
    if (!data) throw new ResponseError.NotFound('Kegiatan tidak ditemukan')
    return data
  }
}

export default MasterKegiatanService
