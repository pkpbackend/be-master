import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterKelompokPengusul extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterKelompokPengusul, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

MasterKelompokPengusul.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterKelompokPengusul',
  tableName: 'masterkelompokpengusuls',
})

export default MasterKelompokPengusul
