import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association

class ProSubOutput extends Model {}

/** @type {import('sequelize').ModelAttributes<ProSubOutput, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  kode: DataTypes.STRING,
  nama: DataTypes.STRING,
  id_output: DataTypes.INTEGER,
  tipe: DataTypes.STRING,
}

ProSubOutput.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProSubOutput',
  tableName: 'prosuboutputs',
})

// Association

export default ProSubOutput
