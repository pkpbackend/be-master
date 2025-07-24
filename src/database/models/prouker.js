import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProUker extends Model {}

/** @type {import('sequelize').ModelAttributes<ProUker, import('sequelize').Optional<any, never>>} */
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
  kd_dat_das: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_kegiatan: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}

ProUker.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProUker',
  tableName: 'proukers',
})

export default ProUker
