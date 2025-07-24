import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association

class Protype extends Model {}

/** @type {import('sequelize').ModelAttributes<Protype, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  nama: DataTypes.STRING,
  kode: DataTypes.STRING,
}

Protype.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProType',
  tableName: 'protypes',
})

// Association

export default Protype
