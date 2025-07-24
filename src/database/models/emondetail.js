import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import EmonDetailTematikPemanfaatan from './emondetailtematikpemanfaatan'
import MasterTematikPemanfaatan from './mastertematikpemanfaatan'

class EmonDetail extends Model {}

/** @type {import('sequelize').ModelAttributes<EmonDetail, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  EmonTableId: {
    type: DataTypes.INTEGER,
  },
  TematikId: {
    type: DataTypes.INTEGER,
  },
  alamat: {
    type: DataTypes.STRING,
  },
  tipe: {
    type: DataTypes.STRING,
  },
  tower: {
    type: DataTypes.INTEGER,
  },
  unit: {
    type: DataTypes.INTEGER,
  },
  koordX: {
    type: DataTypes.FLOAT(11, 7),
  },
  koordY: {
    type: DataTypes.FLOAT(11, 7),
  },
  kontraktor: {
    type: DataTypes.STRING,
  },
  tanggalKontrakKontraktor: {
    type: DataTypes.DATE,
  },
  nilaiKontrakKontraktor: {
    type: DataTypes.BIGINT,
  },
  mk: {
    type: DataTypes.STRING,
  },
  tanggalKontrakMk: {
    type: DataTypes.DATE,
  },
  nilaiKontrakMk: {
    type: DataTypes.BIGINT,
  },
  totalWaktuPelaksanaan: {
    type: DataTypes.INTEGER,
  },
  waktuBerjalanPelaksanaan: {
    type: DataTypes.INTEGER,
  },
  sisahWaktuPelaksanaan: {
    type: DataTypes.INTEGER,
  },
  pekerjaanSaatIni: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('pekerjaanSaatIni')
      if (value) return JSON.parse(value)

      return []
    },
    set(value) {
      if (value) this.setDataValue('pekerjaanSaatIni', JSON.stringify(value))
      else this.setDataValue('pekerjaanSaatIni', null)
    },
  },
  permasalahan: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('permasalahan')
      if (value) return JSON.parse(value)

      return null
    },
    set(value) {
      if (value) this.setDataValue('permasalahan', JSON.stringify(value))
      else this.setDataValue('permasalahan', null)
    },
  },
  tindakLanjut: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('tindakLanjut')
      if (value) return JSON.parse(value)

      return null
    },
    set(value) {
      if (value) this.setDataValue('tindakLanjut', JSON.stringify(value))
      else this.setDataValue('tindakLanjut', null)
    },
  },
  foto: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('foto')
      if (value) return JSON.parse(value)

      return null
    },
    set(value) {
      if (value) this.setDataValue('foto', JSON.stringify(value))
      else this.setDataValue('foto', null)
    },
  },
  video: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('video')
      if (value) return JSON.parse(value)

      return null
    },
    set(value) {
      if (value) this.setDataValue('video', JSON.stringify(value))
      else this.setDataValue('video', null)
    },
  },
  kurvaS: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('kurvaS')
      if (value) return JSON.parse(value)

      return null
    },
    set(value) {
      if (value) this.setDataValue('kurvaS', JSON.stringify(value))
      else this.setDataValue('kurvaS', null)
    },
  },
}

EmonDetail.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'EmonDetail',
  tableName: 'emondetails',
})

EmonDetail.belongsToMany(MasterTematikPemanfaatan, {
  through: EmonDetailTematikPemanfaatan,
})

export default EmonDetail
