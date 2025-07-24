import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import City from './city'

class Provinsi extends Model {}

/** @type {import('sequelize').ModelAttributes<Provinsi, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,
  geojson: DataTypes.JSON,
  zoom: DataTypes.STRING,

  kode_dagri: DataTypes.STRING,
  kode_bps: DataTypes.STRING,
  kode_rkakl: DataTypes.STRING,
  
  kodeWilayah: DataTypes.INTEGER,
}

Provinsi.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Provinsi',
  tableName: 'provinsis',
})

// Association
Provinsi.hasMany(City, {
  foreignKey: 'ProvinsiId',
  sourceKey: 'id',
})

City.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
  targetKey: 'id'
})

export default Provinsi
