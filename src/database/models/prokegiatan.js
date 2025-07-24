import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProKegiatan extends Model {}

/** @type {import('sequelize').ModelAttributes<ProKegiatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  kode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_program: {
    type: DataTypes.INTEGER,
  },
  tipe: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      if (this.getDataValue('tipe')) {
        return JSON.parse(this.getDataValue('tipe'))
      }
      return null
    },
    set(val) {
      if (val) {
        this.setDataValue('tipe', JSON.stringify(val))
      } else {
        this.setDataValue('tipe', null)
      }
    },
  },
}

ProKegiatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProKegiatan',
  tableName: 'prokegiatans',
})

export default ProKegiatan
