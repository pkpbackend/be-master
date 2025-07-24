import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association

class ProOutput extends Model {}

/** @type {import('sequelize').ModelAttributes<ProOutput, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  kode: DataTypes.STRING,
  nama: DataTypes.STRING,
  id_kegiatan: DataTypes.INTEGER,
  tipe: DataTypes.STRING,
}

ProOutput.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProOutput',
  tableName: 'prooutputs',
})

// Association

export default ProOutput
