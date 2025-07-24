import { mkApiPengusulan } from '../../helpers/internalApi'

const apiPengusulan = mkApiPengusulan()

class PemanfaatanUsulanService {
  static async setPemanfaatanUsulan(body) {
    const response = await apiPengusulan.post('/pemanfaatanusulan', body)
    return response.data
  }

  static async getUsulanById(id, accessTokenInternal) {
    console.log(`id ${id}`)
    console.log(`accessTokenInternal ${accessTokenInternal}`)
    try {
      const apiPengusulanWithAuth  = mkApiPengusulan(accessTokenInternal)
      const response = await apiPengusulanWithAuth.get(`usulan/${id}`)
      return response.data
    }
    catch (error) {
      console.log('error')
      console.log(error)
      throw new ResponseError.NotFound('Gagal mendapatkan data Usulan')
    }
  }
}

export default PemanfaatanUsulanService
