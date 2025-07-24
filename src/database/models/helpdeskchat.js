import { Model, DataTypes } from 'sequelize'
import db from './_instance'
import Helpdesk from './helpdesk'
import HelpdeskUser from './helpdeskuser'

class HelpdeskChat extends Model {}

/** @type {import('sequelize').ModelAttributes<HelpdeskChat, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  HelpdeskId: DataTypes.INTEGER,
  HelpdeskUserId: DataTypes.INTEGER,
  chat: DataTypes.TEXT,
}

HelpdeskChat.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'HelpdeskChat',
  tableName: 'helpdeskchats',
})

HelpdeskChat.belongsTo(Helpdesk)
HelpdeskChat.belongsTo(HelpdeskUser)

export default HelpdeskChat
