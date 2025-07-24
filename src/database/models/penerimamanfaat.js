import { Model, DataTypes } from 'sequelize'
import db from './_instance'

// association

class PenerimaManfaat extends Model {}

/** @type {import('sequelize').ModelAttributes<PenerimaManfaat, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },

  tipe: DataTypes.STRING,
  kode: DataTypes.STRING,
  DirektoratId: DataTypes.BIGINT,
}

PenerimaManfaat.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'PenerimaManfaat',
  tableName: 'penerimamanfaats',
})

// Association

export default PenerimaManfaat
