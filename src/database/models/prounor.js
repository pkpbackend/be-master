import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProUnor extends Model {}

/** @type {import('sequelize').ModelAttributes<ProUnor, import('sequelize').Optional<any, never>>} */
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
  id_program: {
    type: DataTypes.INTEGER,
  },
}

ProUnor.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProUnor',
  tableName: 'prounors',
})

// Association

export default ProUnor
