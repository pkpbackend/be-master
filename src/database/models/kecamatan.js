import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import Desa from './desa'
import City from './city'

class Kecamatan extends Model {}

/** @type {import('sequelize').ModelAttributes<Kecamatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  CityId: DataTypes.INTEGER,

  kode_dagri: DataTypes.STRING,
  kode_bps: DataTypes.STRING,
  kode_rkakl: DataTypes.STRING,

  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,
  zoom: DataTypes.STRING,
  geojson: DataTypes.JSON,
}

Kecamatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Kecamatan',
  tableName: 'kecamatans',
})

// Association
Kecamatan.hasMany(Desa, {
  foreignKey: 'KecamatanId',
  sourceKey: 'id',
})

Desa.belongsTo(Kecamatan, {
  foreignKey: 'KecamatanId',
  targetKey: 'id'
})

export default Kecamatan
