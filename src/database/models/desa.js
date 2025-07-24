import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class Desa extends Model {}

/** @type {import('sequelize').ModelAttributes<Desa, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.BIGINT,
  },
  nama: DataTypes.STRING,
  KecamatanId: DataTypes.INTEGER,
  kode_dagri: DataTypes.STRING,
  kode_bps: DataTypes.STRING,
  kode_rkakl: DataTypes.STRING,
  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,
  zoom: DataTypes.STRING,
  geojson: DataTypes.JSON,
}

Desa.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Desa',
  tableName: 'desas',
})

// Association

export default Desa
