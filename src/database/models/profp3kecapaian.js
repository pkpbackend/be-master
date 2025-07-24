import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProfP3KECapaian extends Model {}

/** @type {import('sequelize').ModelAttributes<ProfP3KECapaian, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  ProvinsiId: DataTypes.INTEGER,
  KabupatenId: DataTypes.INTEGER,
  periode: DataTypes.INTEGER,
  djpReguler: DataTypes.INTEGER,
  djpNahp: DataTypes.INTEGER,
  baznasKomplementer: DataTypes.INTEGER,
  baznasUnitKeseluruhan: DataTypes.INTEGER,
}

ProfP3KECapaian.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProfP3KECapaian',
  tableName: 'profp3kecapaians',
})

export default ProfP3KECapaian
