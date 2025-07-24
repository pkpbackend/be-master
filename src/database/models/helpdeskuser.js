import { Model, DataTypes } from 'sequelize'
import db from './_instance'
import Provinsi from './provinsi'

class HelpdeskUser extends Model {}

/** @type {import('sequelize').ModelAttributes<HelpdeskUser, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  pekerjaan: DataTypes.STRING,
  instansi: DataTypes.STRING,
  pendidikanTerakhir: DataTypes.STRING,
  gender: DataTypes.STRING,
  ProvinsiId: DataTypes.INTEGER,
  internalUserId: DataTypes.INTEGER,
  internalUserDetail: {
    type: DataTypes.TEXT,
    get() {
      if (this.getDataValue('internalUserDetail')) {
        return JSON.parse(this.getDataValue('internalUserDetail'))
      }

      return []
    },
  },
}

HelpdeskUser.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'HelpdeskUser',
  tableName: 'helpdeskusers',
})

HelpdeskUser.belongsTo(Provinsi)

export default HelpdeskUser
