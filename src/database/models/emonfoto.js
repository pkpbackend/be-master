import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class EmonFoto extends Model {}

/** @type {import('sequelize').ModelAttributes<EmonFoto, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  kdsatker: {
    type: DataTypes.STRING
  },
  kdpaket: {
    type: DataTypes.STRING
  },
  kdspaket: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.STRING
  },
  longitude: {
    type: DataTypes.STRING
  },
  keterangan: {
    type: DataTypes.STRING
  },
  linkfoto1: {
    type: DataTypes.STRING
  },
  linkfoto2: {
    type: DataTypes.STRING
  },
  linkfoto3: {
    type: DataTypes.STRING
  },
  linkfoto4: {
    type: DataTypes.STRING
  },
  linkfoto5: {
    type: DataTypes.STRING
  },
  kode: {
    type: DataTypes.STRING
  },
}

EmonFoto.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'EmonFoto',
  tableName: 'emonfotos',
})

export default EmonFoto
