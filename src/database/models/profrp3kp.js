import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import Provinsi from './provinsi'
import City from './city'

class ProfRp3kp extends Model {}

/** @type {import('sequelize').ModelAttributes<ProfRp3kp, import('sequelize').Optional<any, never>>} */
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
  statusBelumBelumDianggarkan: DataTypes.STRING,
  statusBelumSudahDianggarkan: DataTypes.STRING,
  statusSedangPersiapan: DataTypes.STRING,
  statusSedangPenyusunanProfil: DataTypes.STRING,
  statusSedangPenyusunanRencana: DataTypes.STRING,
  statusSudahReviewDokumen: DataTypes.STRING,
  statusSudahReviewDokumenTahun: DataTypes.STRING,
  statusSudahProlegda: DataTypes.STRING,
  statusSudahLegalisasiNomor: DataTypes.STRING,
  alokasiAnggaran: DataTypes.BIGINT,
  alokasiAnggaranNotes: DataTypes.STRING,
  jenisAnggaran: DataTypes.STRING,
}

ProfRp3kp.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'ProfRp3kp',
  tableName: 'profrp3kps',
})

ProfRp3kp.belongsTo(Provinsi, {
  foreignKey: 'ProvinsiId',
  targetKey: 'id',
})

ProfRp3kp.belongsTo(City, {
  foreignKey: 'CityId',
  targetKey: 'id',
})

export default ProfRp3kp
