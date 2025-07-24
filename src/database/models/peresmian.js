import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import Provinsi from './provinsi'

class Peresmian extends Model {}

/** @type {import('sequelize').ModelAttributes<Peresmian, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  jenis: DataTypes.STRING,
  nama: DataTypes.STRING,
  lokasi: DataTypes.STRING,
  ProvinsiId: DataTypes.INTEGER,
  CityId: DataTypes.INTEGER,
  masaPelaksanaan: DataTypes.STRING,
  biaya: DataTypes.FLOAT,
  tower: DataTypes.INTEGER,
  lantai: DataTypes.INTEGER,
  unit: DataTypes.INTEGER,
  tipe: DataTypes.STRING,
  status: DataTypes.STRING,
}

Peresmian.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Peresmian',
  tableName: 'peresmians',
})

// Association

Peresmian.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
})

export default Peresmian
