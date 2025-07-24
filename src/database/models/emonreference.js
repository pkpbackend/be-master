import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class EmonReference extends Model {}

/** @type {import('sequelize').ModelAttributes<EmonReference, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING
  },
  value: {
    type: DataTypes.JSON
  },
}

EmonReference.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'EmonReference',
  tableName: 'emonreferences',
})

export default EmonReference
