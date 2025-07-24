import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProTargetGroup extends Model {}

/** @type {import('sequelize').ModelAttributes<ProTargetGroup, import('sequelize').Optional<any, never>>} */
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
  tipe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

ProTargetGroup.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProTargetGroup',
  tableName: 'protargetgroups',
})

// Association
export default ProTargetGroup
