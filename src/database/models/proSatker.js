import { Model, DataTypes } from 'sequelize'
import db from './_instance'
import ProBalai from './probalai'

class ProSatker extends Model {}

/** @type {import('sequelize').ModelAttributes<ProSatker, import('sequelize').Optional<any, never>>} */
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

ProSatker.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProSatker',
  tableName: 'prosatkers',
})

// Association
ProSatker.belongsTo(ProBalai, {
  foreignKey: 'id_balai',
  targetKey: 'id',
})

export default ProSatker
