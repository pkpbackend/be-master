import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterMajorProjectPemanfaatan extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterMajorProjectPemanfaatan, import('sequelize').Optional<any, never>>} */
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
  kode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

MasterMajorProjectPemanfaatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterMajorProjectPemanfaatan',
  tableName: 'mastermajorprojectpemanfaatans',
})

export default MasterMajorProjectPemanfaatan
