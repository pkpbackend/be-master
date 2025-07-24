import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class MasterKegiatan extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterKegiatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  name: DataTypes.STRING,
  DirektoratId: DataTypes.INTEGER,
}

MasterKegiatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterKegiatan',
  tableName: 'masterkegiatans',
})

export default MasterKegiatan
