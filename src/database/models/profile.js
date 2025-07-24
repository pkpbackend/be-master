import { Model, DataTypes } from 'sequelize'
import db from './_instance'

import Direktorat from './direktorat'
import ProOutput from './prooutput'
import Provinsi from './provinsi'
import City from './city'
import Kecamatan from './kecamatan'
import Desa from './desa'
import ProUnor from './prounor'
import ProType from './protype'
import ProProgram from './proprogram'
import ProKegiatan from './prokegiatan'
import ProSatker from './proSatker'
import ProTargetGroup from './protargetgroup'
import ProSubOutput from './prosuboutput'
import ProUker from './prouker'
import MasterKelompokPengusul from './masterkelompokpengusul'
import MasterMajorProjectPemanfaatan from './mastermajorprojectpemanfaatan'
import KegiatanOpor from './kegiatanopor'
import MasterTematikPemanfaatan from './mastertematikpemanfaatan'
import ProfileTematikPemanfaatan from './profiletematikpemanfaatan'
import MasterKondisiBangunan from './masterkondisibangunan'
import SerahTerimaComment from './serahterimacomment'
import ProBalai from './probalai'

class Profile extends Model {}

/** @type {import('sequelize').ModelAttributes<Profile, import('sequelize').Optional<any, never>>} */
const attributes = {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  id_program: DataTypes.INTEGER,
  id_unor: DataTypes.INTEGER,
  id_kegiatan: DataTypes.INTEGER,
  kegiatan: DataTypes.STRING,
  id_uker: DataTypes.INTEGER,
  id_output: DataTypes.INTEGER,
  output: DataTypes.STRING,
  id_suboutput: DataTypes.INTEGER,
  id_satker: DataTypes.INTEGER,
  id_tgt_hunian: DataTypes.INTEGER,
  id_provinsi: DataTypes.INTEGER,
  id_kabkota: DataTypes.INTEGER,
  id_kecamatan: DataTypes.INTEGER,
  id_keldesa: DataTypes.INTEGER,

  alamat: DataTypes.STRING,
  latitude: DataTypes.STRING,
  longitude: DataTypes.STRING,

  klpk_pengusul: DataTypes.STRING,
  lbg_pengumpul: DataTypes.STRING,
  klpk_penerima: DataTypes.STRING,
  lbg_penerima: DataTypes.STRING,

  tgt_hunian: DataTypes.STRING,
  jml_unit: DataTypes.INTEGER,
  tipe_unit: DataTypes.STRING,
  tipologi: DataTypes.STRING,
  tower: DataTypes.INTEGER,

  jml_lantai: DataTypes.INTEGER,
  myc: DataTypes.STRING,
  no_kontrak_pemb: DataTypes.STRING,
  tgl_kontrak_pemb: DataTypes.DATE,
  satker_pelaksana: DataTypes.STRING,

  nm_kontraktor: DataTypes.STRING,
  nm_pengawas_pemb: DataTypes.STRING,
  nm_perencana_pemb: DataTypes.STRING,
  biaya_pembangunan: DataTypes.BIGINT,
  biaya_pengawasan: DataTypes.BIGINT,
  biaya_perencanaan: DataTypes.BIGINT,

  nm_pengembang: DataTypes.STRING,
  asosiasi: DataTypes.STRING,
  nm_perumahan: DataTypes.STRING,
  sumb_dana: DataTypes.STRING,

  thn_anggaran: DataTypes.STRING,
  kode_anggaran: DataTypes.STRING,

  thn_bang: DataTypes.STRING,
  thn_selesaibang: DataTypes.STRING,
  status_penghunian_id: DataTypes.INTEGER,
  thn_huni: DataTypes.STRING,
  jml_unit_huni: DataTypes.INTEGER,
  jml_tower_huni: DataTypes.INTEGER,
  alasan_belum_terhuni: DataTypes.TEXT,
  tanggal_target_terhuni: DataTypes.DATE,

  stat_srh_trm: DataTypes.TEXT,
  id_keterangan_serah_terima: DataTypes.INTEGER,
  keterangan_serah_terima: DataTypes.TEXT,
  no_bast_lainnya: DataTypes.STRING,
  thn_serah_aset: DataTypes.STRING,

  thn_revit: DataTypes.STRING,
  nm_kontraktor_revit: DataTypes.STRING,
  nm_pengawas_revit: DataTypes.STRING,
  nm_perancana_revit: DataTypes.STRING,
  biaya_kontraktor_revit: DataTypes.BIGINT,
  biaya_pengawasan_revit: DataTypes.BIGINT,
  biaya_perncanaan_revit: DataTypes.BIGINT,

  thn_meubel: DataTypes.STRING,
  jumlah_meubel: DataTypes.STRING,
  biaya_meubel: DataTypes.STRING,
  penyedia_meubel: DataTypes.STRING,

  tot_biaya_bang: DataTypes.BIGINT,
  tot_biaya_pengawasan: DataTypes.BIGINT,
  tot_biaya_perencanaan: DataTypes.BIGINT,
  tot_biaya: DataTypes.BIGINT,

  status_opor: DataTypes.BOOLEAN,
  biaya_opor_konstruksi_fisik: DataTypes.INTEGER,
  biaya_opor_perencanaan_konstruksi: DataTypes.INTEGER,
  biaya_opor_pengawasan_konstruksi: DataTypes.INTEGER,
  biaya_opor_pengelolaan_kegiatan: DataTypes.INTEGER,

  ProTypeId: DataTypes.INTEGER,
  pxMasterId: DataTypes.INTEGER,
  id_type: DataTypes.INTEGER,
  type: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  createdBy: DataTypes.INTEGER,
  KelompokPengusulId: DataTypes.INTEGER,
  MasterMajorProjectPemanfaatanId: DataTypes.INTEGER,
  KondisiBangunanId: DataTypes.INTEGER,

  status_peresmian: DataTypes.TINYINT(1),

  foto: {
    type: DataTypes.TEXT,
    get() {
      if (this.getDataValue('foto')) {
        return JSON.parse(this.getDataValue('foto'))
      }

      return []
    },
    set(val) {
      if (val) {
        this.setDataValue('foto', JSON.stringify(val))
      } else {
        this.setDataValue('foto', null)
      }
    },
  },
  video: {
    type: DataTypes.TEXT,
    get() {
      if (this.getDataValue('video')) {
        return JSON.parse(this.getDataValue('video'))
      }

      return []
    },
    set(val) {
      if (val) {
        this.setDataValue('video', JSON.stringify(val))
      } else {
        this.setDataValue('video', null)
      }
    },
  },
  dokumenST: {
    type: DataTypes.TEXT,
    get() {
      if (this.getDataValue('dokumenST')) {
        return JSON.parse(this.getDataValue('dokumenST'))
      }

      return []
    },
    set(val) {
      if (val) {
        this.setDataValue('dokumenST', JSON.stringify(val))
      } else {
        this.setDataValue('dokumenST', null)
      }
    },
  },
  dokumenOPOR: {
    type: DataTypes.TEXT,
    get() {
      if (this.getDataValue('dokumenOPOR')) {
        return JSON.parse(this.getDataValue('dokumenOPOR'))
      }

      return []
    },
    set(val) {
      if (val) {
        this.setDataValue('dokumenOPOR', JSON.stringify(val))
      } else {
        this.setDataValue('dokumenOPOR', null)
      }
    },
  },
  additional_detail_files: DataTypes.TEXT,
  UsulanId: DataTypes.BIGINT,
  Usulan: DataTypes.JSON,

  // 0 = Perlu Perbaikan (Direktorat), 1 = Disetujui (Direktorat),
  // 2 = Perlu Perbaikan (SSPP), 3 = Disetujui (SSPP)
  pemanfaatanStatus: DataTypes.INTEGER,
  pemanfaatanStatusData: DataTypes.JSON,

  serahTerimaStatus: DataTypes.INTEGER,
  serahTerimaType: DataTypes.STRING,
  nup: DataTypes.STRING,
  kategoriBarang: DataTypes.STRING,
  noDipa: DataTypes.STRING,
  tglDipa: DataTypes.DATE,
  kodeWilayah: DataTypes.INTEGER,
  kontrakFisikBangunanRumah: DataTypes.JSON,
  kontrakPsu: DataTypes.JSON,
  kontrakMebel: DataTypes.JSON,
  kontrakPerencana: DataTypes.JSON,
  kontrakPengawas: DataTypes.JSON,
  serahTerimaPemanfaatan: DataTypes.JSON,
  namaPaket: DataTypes.STRING,
  UserId: DataTypes.INTEGER,
  User: DataTypes.JSON,
  jmlStaUnit: DataTypes.INTEGER,

  noSta: DataTypes.STRING,
  // noSta: {
  //   type: DataTypes.VIRTUAL,
  //   get() {
  //     let noSta = `STA ${this.getDataValue('id')}`
  //     let noPemanfaatan = ''
  //     if (
  //       this.getDataValue('serahTerimaPemanfaatan') !== null &&
  //       this.getDataValue('serahTerimaPemanfaatan').length > 0
  //     ) {
  //       noPemanfaatan +=
  //         'P ' + this.getDataValue('serahTerimaPemanfaatan').join('-')
  //     }
  //     noSta += noPemanfaatan != '' ? ' - ' + noPemanfaatan : ''
  //     return noSta
  //   },
  // },
  // noPemanfaatan: {
  //   type: DataTypes.VIRTUAL,
  //   get() {
  //     return `P ${this.getDataValue('id')}`
  //   },
  // },
}

Profile.init(attributes, {
  sequelize: db.sequelize,
  modelName: 'Profile',
  tableName: 'profiles',
})

// Association

Profile.belongsTo(Provinsi, {
  foreignKey: 'id_provinsi',
  targetKey: 'id',
})

Provinsi.hasMany(Profile, {
  foreignKey: 'id_provinsi',
  sourceKey: 'id',
})

Profile.belongsTo(City, {
  foreignKey: 'id_kabkota',
  targetKey: 'id',
})

Profile.belongsTo(Kecamatan, {
  foreignKey: 'id_kecamatan',
  targetKey: 'id',
})

Profile.belongsTo(Desa, {
  foreignKey: 'id_keldesa',
  targetKey: 'id',
})

Profile.belongsTo(Direktorat, {
  // foreignKey: 'ProtypeId',
  foreignKey: 'id_type',
  targetKey: 'id',
})

Profile.belongsTo(ProType, {
  foreignKey: 'id_type',
  targetKey: 'id',
})

Profile.belongsTo(ProProgram, {
  foreignKey: 'id_program',
  targetKey: 'id',
})

Profile.belongsTo(ProUnor, {
  foreignKey: 'id_unor',
  targetKey: 'id',
})

Profile.belongsTo(ProOutput, {
  foreignKey: 'id_output',
  targetKey: 'id',
})

Profile.belongsTo(ProKegiatan, {
  foreignKey: 'id_kegiatan',
  targetKey: 'id',
})

Profile.belongsTo(ProBalai, {
  foreignKey: 'id_balai',
  targetKey: 'id',
})

Profile.belongsTo(ProSatker, {
  foreignKey: 'id_satker',
  targetKey: 'id',
})

Profile.belongsTo(ProUker, {
  foreignKey: 'id_uker',
  targetKey: 'id',
})

Profile.belongsTo(ProSubOutput, {
  foreignKey: 'id_suboutput',
  targetKey: 'id',
})

Profile.belongsTo(ProTargetGroup, {
  foreignKey: 'id_tgt_hunian',
  targetKey: 'id',
})

Profile.belongsTo(MasterKelompokPengusul, {
  foreignKey: 'KelompokPengusulId',
  targetKey: 'id',
})

Profile.belongsTo(MasterMajorProjectPemanfaatan, {
  foreignKey: 'MasterMajorProjectPemanfaatanId',
  targetKey: 'id',
})

Profile.hasMany(KegiatanOpor)

Profile.belongsToMany(MasterTematikPemanfaatan, {
  through: ProfileTematikPemanfaatan,
})

Profile.belongsTo(MasterKondisiBangunan, {
  foreignKey: 'KondisiBangunanId',
  targetKey: 'id',
})

Profile.hasMany(SerahTerimaComment, {
  foreignKey: 'SerahTerimaId',
  targetKey: 'id',
})

export default Profile
