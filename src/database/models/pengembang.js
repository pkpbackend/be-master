import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class Pengembang extends Model {}

/** @type {import('sequelize').ModelAttributes<Pengembang, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  namaPerusahaan: DataTypes.STRING,
  telpPenanggungJawab: DataTypes.STRING,
  email: DataTypes.STRING,
  npwp: DataTypes.STRING,
  fileNpwp: DataTypes.STRING,
  isValid: DataTypes.BOOLEAN,
  IdPengembangSikumbang: DataTypes.INTEGER,
}

Pengembang.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Pengembang',
  tableName: 'pengembangs',
})

export default Pengembang
