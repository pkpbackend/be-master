import { Model, DataTypes } from 'sequelize'
import db from './_instance'
// import Profile from './profile'

class ProProgram extends Model {}

/** @type {import('sequelize').ModelAttributes<ProProgram, import('sequelize').Optional<any, never>>} */
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

ProProgram.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProProgram',
  tableName: 'proprograms',
})

// Association
// ProProgram.hasMany(Profile, {
//   foreignKey: 'ProtypeId',
//   targetKey: 'id',
// })

export default ProProgram
