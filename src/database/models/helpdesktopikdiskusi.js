import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class HelpdeskTopikDiskusi extends Model {}

/** @type {import('sequelize').ModelAttributes<HelpdeskTopikDiskusi, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
}

HelpdeskTopikDiskusi.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'HelpdeskTopikDiskusi',
  tableName: 'helpdesktopikdiskusis',
})

export default HelpdeskTopikDiskusi
