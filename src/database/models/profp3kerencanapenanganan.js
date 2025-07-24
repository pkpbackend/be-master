import { Model, DataTypes } from 'sequelize'
import db from './_instance'

class ProfP3KERencanaPenanganan extends Model {}

/** @type {import('sequelize').ModelAttributes<ProfP3KERencanaPenanganan, import('sequelize').Optional<any, never>>} */
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
  rencanaReguler: DataTypes.INTEGER,
  rencanaNahp: DataTypes.INTEGER,
}

ProfP3KERencanaPenanganan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProfP3KERencanaPenanganan',
  tableName: 'profp3kerencanapenanganans',
})

export default ProfP3KERencanaPenanganan
