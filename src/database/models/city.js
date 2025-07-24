import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import Kecamatan from './kecamatan'
import Provinsi from './provinsi'

class City extends Model {}

/** @type {import('sequelize').ModelAttributes<City, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  ProvinsiId: DataTypes.INTEGER,
  backlog: DataTypes.FLOAT,
  rtlh: DataTypes.FLOAT,
  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,
  zoom: DataTypes.STRING,
  geojson: DataTypes.JSON,
  kode_dagri: DataTypes.STRING,
  kode_bps: DataTypes.STRING,
  kode_rkakl: DataTypes.STRING,
}

City.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'City',
  tableName: 'cities',
})

// Association
City.hasMany(Kecamatan, {
  foreignKey: 'CityId',
  sourceKey: 'id',
})

Kecamatan.belongsTo(City, {
  foreignKey: 'CityId',
  targetKey: 'id'
})

export default City
