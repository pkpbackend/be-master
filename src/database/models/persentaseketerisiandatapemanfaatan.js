import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association
import Provinsi from './provinsi'

class PersentaseKeterisianDataPemanfaatan extends Model {}

/** @type {import('sequelize').ModelAttributes<PersentaseKeterisianDataPemanfaatan, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  ProvinsiId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalCell: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalCellTerisi: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  persentaseCellTerisi: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}

PersentaseKeterisianDataPemanfaatan.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'PersentaseKeterisianDataPemanfaatan',
  tableName: 'persentaseketerisiandatapemanfaatans',
})

// Association
PersentaseKeterisianDataPemanfaatan.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
  sourceKey: 'id',
})

export default PersentaseKeterisianDataPemanfaatan
