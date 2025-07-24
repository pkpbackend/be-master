import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterKondisiBangunan extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterKondisiBangunan, import('sequelize').Optional<any, never>>} */
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

MasterKondisiBangunan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterKondisiBangunan',
  tableName: 'masterkondisibangunans',
})

export default MasterKondisiBangunan
