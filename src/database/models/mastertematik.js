import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterTematik extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterTematik, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  skor: DataTypes.INTEGER,
}

MasterTematik.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterTematik',
  tableName: 'mastertematiks',
})

export default MasterTematik
