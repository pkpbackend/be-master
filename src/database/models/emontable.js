import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import Provinsi from './provinsi'
import City from './city'
import EmonDetail from './emondetail'

class EmonTable extends Model {}

/** @type {import('sequelize').ModelAttributes<EmonTable, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  kode: {
    type: DataTypes.STRING,
  },
  kdsatker: {
    type: DataTypes.STRING,
  },
  nmsatker: {
    type: DataTypes.STRING,
  },
  kdprog: {
    type: DataTypes.STRING,
  },
  nmprogram: {
    type: DataTypes.STRING,
  },
  kdgiat: {
    type: DataTypes.STRING,
  },
  nmgiat: {
    type: DataTypes.STRING,
  },
  kdoutput: {
    type: DataTypes.STRING,
  },
  nmoutput: {
    type: DataTypes.STRING,
  },
  kdpaket: {
    type: DataTypes.STRING,
  },
  kdspaket: {
    type: DataTypes.STRING,
  },
  nmpaket: {
    type: DataTypes.STRING,
  },
  target: {
    type: DataTypes.STRING,
  },
  pengadaan: {
    type: DataTypes.STRING,
  },
  jenis_paket: {
    type: DataTypes.STRING,
  },

  pagu: { type: DataTypes.STRING },
  pagurpm: { type: DataTypes.STRING },
  pagusbsn: { type: DataTypes.STRING },
  paguphln: { type: DataTypes.STRING },

  realisasi: { type: DataTypes.STRING },
  realisasirpm: { type: DataTypes.STRING },
  realisasisbsn: { type: DataTypes.STRING },
  realisasiphln: { type: DataTypes.STRING },

  progreskeu: {
    type: DataTypes.STRING,
  },
  progresfis: {
    type: DataTypes.STRING,
  },
  tglkirim: {
    type: DataTypes.DATE,
  },
  rekanan: {
    type: DataTypes.STRING,
  },
  tglmulai: {
    type: DataTypes.DATE,
  },
  tglselesai: {
    type: DataTypes.DATE,
  },
  ProvinsiId: { type: DataTypes.INTEGER },
  provinsi: {
    type: DataTypes.STRING,
  },
  KabkotaId: { type: DataTypes.INTEGER },
  kabupaten: {
    type: DataTypes.STRING,
  },
  kdlokasi: {
    type: DataTypes.STRING,
  },
  kdkabkota: {
    type: DataTypes.STRING,
  },
  nilai_kontrak: {
    type: DataTypes.STRING,
  },
  fotos: {
    type: DataTypes.TEXT,
  },
  rekanans: {
    type: DataTypes.TEXT,
  },
  field26: {
    type: DataTypes.STRING,
  },
  thang: {
    type: DataTypes.STRING,
  },
  additional: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.INTEGER,
  },
  prognosisKeuangan: { type: DataTypes.FLOAT(18, 2) },
  prognosisPresentaseKeuangan: { type: DataTypes.FLOAT(18, 2) },
  prognosisPresentaseFisik: { type: DataTypes.FLOAT(18, 2) },
  deviasiPresentaseKeuangan: { type: DataTypes.FLOAT(18, 2) },
  deviasiPresentaseFisik: { type: DataTypes.FLOAT(18, 2) },
  rencanaTindakLanjut: { type: DataTypes.TEXT },
  metodePemilihan: { type: DataTypes.STRING },
  jenisKontrak: { type: DataTypes.STRING },
  kdmetode: { type: DataTypes.STRING },
  metode: { type: DataTypes.STRING },
}

EmonTable.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'EmonTable',
  tableName: 'emontables',
})

EmonTable.belongsTo(Provinsi, {
  foreignKey: 'kdlokasi',
  targetKey: 'kode_rkakl',
})

EmonTable.belongsTo(City, {
  foreignKey: 'kdkabkota',
  targetKey: 'kode_rkakl',
})

EmonTable.hasMany(EmonDetail, {
  foreignKey: 'EmonTableId',
  targetKey: 'id',
})

export default EmonTable
