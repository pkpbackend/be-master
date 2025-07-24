import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class EmonDetailTematikPemanfaatan extends Model {}

/** @type {import('sequelize').ModelAttributes<EmonDetailTematikPemanfaatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  MasterTematikPemanfaatanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  EmonDetailId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}

EmonDetailTematikPemanfaatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'EmonDetailTematikPemanfaatan',
  tableName: 'emondetailtematikpemanfaatans',
})

export default EmonDetailTematikPemanfaatan
