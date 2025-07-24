import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import MasterDokumen from './masterdokumen'

class MasterDokumenSerahTerima extends Model {}

/** @type {import('sequelize').ModelAttributes<MasterDokumenSerahTerima, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  MasterDokumenId: DataTypes.INTEGER,
  serahTerimaType: DataTypes.STRING,
  isRequired: DataTypes.BOOLEAN,
}

MasterDokumenSerahTerima.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'MasterDokumenSerahTerima',
  tableName: 'masterdokumenserahterimas',
})

MasterDokumenSerahTerima.belongsTo(MasterDokumen, {
  sourceKey: 'MasterDokumenId',
})

export default MasterDokumenSerahTerima
