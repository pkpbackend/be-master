import { Model, DataTypes } from 'sequelize'
import db from './_instance'
import Profile from './profile'
import MasterKegiatanOPOR from './masterKegiatanOPOR'

class KegiatanOpor extends Model {}

/** @type {import('sequelize').ModelAttributes<KegiatanOpor, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  ProfileId: DataTypes.INTEGER,
  MasterKegiatanOPORId: DataTypes.INTEGER,
  namaKontraktorKonsultan: DataTypes.STRING,
  anggaran: DataTypes.FLOAT(22, 2),
  biaya_konstruksi_fisik: DataTypes.DECIMAL(25, 2),
  biaya_perencanaan_konstruksi: DataTypes.DECIMAL(25, 2),
  biaya_pengawasan_konstruksi: DataTypes.DECIMAL(25, 2),
  biaya_pengelolaan_kegiatan: DataTypes.DECIMAL(25, 2),
  tahun: DataTypes.INTEGER,
}

KegiatanOpor.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'KegiatanOpor',
  tableName: 'kegiatanopors',
})

// KegiatanOpor.belongsTo(Profile, {
//   foreignKey: 'ProfileId',
//   targetKey: 'id',
// })
KegiatanOpor.belongsTo(MasterKegiatanOPOR, {
  foreignKey: 'MasterKegiatanOPORId',
  targetKey: 'id',
})

export default KegiatanOpor
