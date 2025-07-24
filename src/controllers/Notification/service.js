import { SCOPE_REGION_ROLE } from '../../constants/Wilayah'
import UserService from '../../controllers/User/service'
import { mkApiPortal } from '../../helpers/internalApi'
import _ from 'lodash'

const apiPortal = mkApiPortal()

class NotificationService {
  static async create(body) {
    const response = await apiPortal.post('/notification', body)
    return response.data
  }

  static async bulkCreate(body) {
    const response = await apiPortal.post('/notification/bulk', body)
    return response.data
  }

  static async notifyAdminDirektorat(
    roleids,
    dataNotification,
    { updatedById, ProvinsiId }
  ) {
    const adminUsers = await UserService.getInternalAdminByRoleIds(
      JSON.stringify(roleids)
    )

    let notifyUsers = []

    //filter wilayah
    adminUsers.forEach((user) => {
      if (user.Role.ScopeRegionRoleId === SCOPE_REGION_ROLE.PER_PROVINSI) {
        if (user.ProvinsiId === ProvinsiId) {
          notifyUsers.push(user)
        }
      } else if (
        user.Role.ScopeRegionRoleId === SCOPE_REGION_ROLE.PER_KABUPATEN
      ) {
        if (user.CityId === CityId) {
          notifyUsers.push(user)
        }
      } else if (
        user.Role.ScopeRegionRoleId === SCOPE_REGION_ROLE.PER_PROVINSI_TERPILIH
      ) {
        let region = user.region ? JSON.parse(user.region) : null
        let { provinsi } = region

        if (_.some(provinsi, ['value', ProvinsiId])) {
          notifyUsers.push(user)
        }
      } else if (
        user.Role.ScopeRegionRoleId === SCOPE_REGION_ROLE.PER_KABUPATEN_TERPILIH
      ) {
        let region = user.region ? JSON.parse(user.region) : null
        let { kabupaten } = region

        let arrKabupaten = []

        kabupaten.forEach((prov) => {
          prov.data.forEach((kabu) => {
            arrKabupaten.push(kabu)
          })
        })

        if (_.some(arrKabupaten, ['value', CityId])) {
          notifyUsers.push(user)
        }
      } else {
        notifyUsers.push(user)
      }
    })

    const arrNotif = []
    if (Array.isArray(notifyUsers) && notifyUsers.length > 0) {
      await Promise.all(
        notifyUsers.map(async (value) => {
          const { id: UserId, Role } = value
          const { DirektoratId, Direktorat, id: RoleId } = Role

          let updatedBy = await UserService.getInternalUserById(updatedById)
          if (typeof updatedBy.id === 'undefined') updatedBy = null

          arrNotif.push({
            ...dataNotification,
            UserId,
            User: value,
            DirektoratId,
            Direktorat,
            RoleId,
            Role,
            read: false,
            updatedById,
            updatedBy: updatedBy,
          })
        })
      )
    }

    await this.bulkCreate(arrNotif)
  }
}

export default NotificationService
