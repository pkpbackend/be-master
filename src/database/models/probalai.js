import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProBalai extends Model {}

/** @type {import('sequelize').ModelAttributes<ProBalai, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  kode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

ProBalai.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProBalai',
  tableName: 'probalais',
})

export default ProBalai
