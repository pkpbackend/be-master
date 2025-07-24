import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class SerahTerimaComment extends Model {}

/** @type {import('sequelize').ModelAttributes<SerahTerimaComment, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  message: DataTypes.TEXT,
  SerahTerimaId: DataTypes.INTEGER,
  UserId: DataTypes.INTEGER,
  User: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}

SerahTerimaComment.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'SerahTerimaComment',
  tableName: 'serahterimacomments',
})

export default SerahTerimaComment
