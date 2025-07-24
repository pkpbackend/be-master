import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class KomponenPengajuan extends Model {}

/** @type {import('sequelize').ModelAttributes<KomponenPengajuan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
  UsulanTypeId : DataTypes.INTEGER
}

KomponenPengajuan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'KomponenPengajuan',
  tableName: 'komponenpengajuans',
})

export default KomponenPengajuan
