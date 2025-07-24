import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import Provinsi from './provinsi'
import City from './city'

class ProfPkp extends Model {}

/** @type {import('sequelize').ModelAttributes<ProfPkp, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  ProvinsiId: DataTypes.INTEGER,
  CityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nama: DataTypes.STRING,
  type: DataTypes.STRING,
  status: DataTypes.STRING,
  skPKPPermen: DataTypes.STRING,
  skPKPNonPermen: DataTypes.STRING,
  noSkPembentukan: DataTypes.STRING,
  tglSk: DataTypes.DATE,
  tglSkHingga: DataTypes.DATE,
}

ProfPkp.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProfPkp',
  tableName: 'profpkps',
})

ProfPkp.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
  targetKey: 'id',
})

ProfPkp.belongsTo(City, {
  foreignKey: 'CityId',
  targetKey: 'id',
})

export default ProfPkp
