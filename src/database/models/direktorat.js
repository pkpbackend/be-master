import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class Direktorat extends Model {}

/** @type {import('sequelize').ModelAttributes<Direktorat, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  name: DataTypes.STRING,
  kodeKegiatan: DataTypes.BIGINT,
  namaKegiatan: DataTypes.STRING,
  modelKegiatan: DataTypes.STRING,
}

Direktorat.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Direktorat',
  tableName: 'direktorats',
})

export default Direktorat
