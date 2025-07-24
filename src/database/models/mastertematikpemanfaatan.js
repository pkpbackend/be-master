import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterTematikPemanfaatan extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterTematikPemanfaatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

MasterTematikPemanfaatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterTematikPemanfaatan',
  tableName: 'mastertematikpemanfaatans',
})

export default MasterTematikPemanfaatan
