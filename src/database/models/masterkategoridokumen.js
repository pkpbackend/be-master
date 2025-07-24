import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterKategoriDokumen extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterKategoriDokumen, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  DirektoratId : DataTypes.INTEGER
}

MasterKategoriDokumen.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterKategoriDokumen',
  tableName: 'masterkategoridokumens',
})

export default MasterKategoriDokumen
