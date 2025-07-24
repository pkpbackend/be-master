import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class SerahTerimaUnit extends Model {}

/** @type {import('sequelize').ModelAttributes<SerahTerimaUnit, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  SerahTerimaId: DataTypes.INTEGER,
  PemanfaatanId: DataTypes.INTEGER,
  jumlahUnit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}

SerahTerimaUnit.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'SerahTerimaUnit',
  tableName: 'serahterimaunits',
})

export default SerahTerimaUnit
