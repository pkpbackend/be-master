import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import MasterKategoriDokumen from './masterkategoridokumen'

class MasterDokumen extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterDokumen, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: DataTypes.STRING,
  model: DataTypes.STRING,
  jenisData: DataTypes.STRING,
  jenisDirektif: DataTypes.STRING,
  required: DataTypes.STRING,
  type: DataTypes.INTEGER,
  MasterKategoriDokumenId: DataTypes.INTEGER,
  maxSize: DataTypes.INTEGER,
  typeFile: DataTypes.STRING,
  ditRusunField: DataTypes.STRING,
  jenisBantuan: DataTypes.TEXT,
  sort: DataTypes.INTEGER,
  formatDokumen: DataTypes.TEXT,
}

MasterDokumen.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterDokumen',
  tableName: 'masterdokumens',
})

// Association
MasterDokumen.belongsTo(MasterKategoriDokumen)

MasterKategoriDokumen.hasMany(MasterDokumen, {
  foreignKey: 'MasterKategoriDokumenId',
  sourceKey: 'id',
})

export default MasterDokumen
