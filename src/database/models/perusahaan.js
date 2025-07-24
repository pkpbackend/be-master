import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import Provinsi from './provinsi'
import City from './city'
import Kecamatan from './kecamatan'
import Desa from './desa'

class Perusahaan extends Model {}

/** @type {import('sequelize').ModelAttributes<Perusahaan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  name: DataTypes.STRING,
  asosiasi: DataTypes.STRING,
  alamat: DataTypes.STRING,
  kodePos: DataTypes.STRING,
  rtRw: DataTypes.STRING,
  namaDirektur: DataTypes.STRING,
  telpKantor: DataTypes.STRING,
  telpDirektur: DataTypes.STRING,
  telpPenanggungJawab: DataTypes.STRING,
  email: DataTypes.STRING,
  website: DataTypes.STRING,
  npwp: DataTypes.STRING,
  ProvinsiId: DataTypes.INTEGER,
  CityId: DataTypes.INTEGER,
  DesaId: DataTypes.BIGINT,
  KecamatanId: DataTypes.INTEGER,
}

Perusahaan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Perusahaan',
  tableName: 'perusahaans',
})

// Association
Perusahaan.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
  sourceKey: 'id',
})
Perusahaan.belongsTo(City, {
  foreignKey: 'CityId',
  sourceKey: 'id',
})
Perusahaan.belongsTo(Kecamatan, {
  foreignKey: 'KecamatanId',
  sourceKey: 'id',
})
Perusahaan.belongsTo(Desa, {
  foreignKey: 'DesaId',
  sourceKey: 'id',
})

export default Perusahaan
