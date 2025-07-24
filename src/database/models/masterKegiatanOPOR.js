import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterKegiatanOPOR extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterKegiatanOPOR, import('sequelize').Optional<any, never>>} */
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

MasterKegiatanOPOR.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterKegiatanOPOR',
  tableName: 'masterkegiatanopors',
})

export default MasterKegiatanOPOR
