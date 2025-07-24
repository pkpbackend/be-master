import { Model, DataTypes } from 'sequelize'
import db from './_instance'
import Direktorat from './direktorat'
import HelpdeskTopikDiskusi from './helpdesktopikdiskusi'
import HelpdeskUser from './helpdeskuser'

class Helpdesk extends Model {}

/** @type {import('sequelize').ModelAttributes<Helpdesk, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  HelpdeskTopikDiskusiId: DataTypes.INTEGER,
  HelpdeskUserId: DataTypes.INTEGER,
  DirektoratId: DataTypes.INTEGER,
  status: DataTypes.BOOLEAN,
  rating: DataTypes.INTEGER,
  endedBy: DataTypes.INTEGER,
  isAdmin: DataTypes.BOOLEAN,
  title: DataTypes.STRING,
}

Helpdesk.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Helpdesk',
  tableName: 'helpdesks',
})

Helpdesk.belongsTo(Direktorat)
Direktorat.hasMany(Helpdesk)
Helpdesk.belongsTo(HelpdeskTopikDiskusi, {
  as: 'topikDiskusi',
  foreignKey: 'HelpdeskTopikDiskusiId',
  targetKey: 'id',
})
Helpdesk.belongsTo(HelpdeskUser, {
  as: 'user',
  foreignKey: 'HelpdeskUserId',
  targetKey: 'id',
})
Helpdesk.belongsTo(HelpdeskUser, {
  as: 'endBy',
  foreignKey: 'endedBy',
  targetKey: 'id',
})

export default Helpdesk
