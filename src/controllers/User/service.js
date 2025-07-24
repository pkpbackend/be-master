import { mkApiSSO } from '../../helpers/internalApi'

const apiSSO = mkApiSSO()

class UserService {
  static async getInternalUserById(id) {
    const response = await apiSSO.get(`/user/internal/user/${id}`)
    return response.data
  }

  static async getInternalAdminByDirektoratId(direktoratId) {
    const response = await apiSSO.get(
      `/user/internal/admin?direktoratId=${direktoratId}`
    )
    return response.data
  }

  static async getInternalAdminByRoleIds(roleids) {
    const response = await apiSSO.get(`/user/internal/admin?roleids=${roleids}`)
    return response.data
  }
}

export default UserService
