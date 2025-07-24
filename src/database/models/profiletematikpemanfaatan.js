import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProfileTematikPemanfaatan extends Model {}

/** @type {import('sequelize').ModelAttributes<ProfileTematikPemanfaatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  MasterTematikPemanfaatanId: DataTypes.INTEGER,
  ProfileId: DataTypes.INTEGER,
}

ProfileTematikPemanfaatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProfileTematikPemanfaatan',
  tableName: 'profiletematikpemanfaatans',
})

export default ProfileTematikPemanfaatan
