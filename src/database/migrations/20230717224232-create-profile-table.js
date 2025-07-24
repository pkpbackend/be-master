'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_balai: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_program: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_kegiatan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_tgt_hunian: {
        type: Sequelize.INTEGER,
      },
      id_unor: {
        type: Sequelize.INTEGER,
      },
      id_uker: {
        type: Sequelize.INTEGER,
      },
      id_output: {
        type: Sequelize.INTEGER,
      },
      id_suboutput: {
        type: Sequelize.INTEGER,
      },
      id_satker: {
        type: Sequelize.INTEGER,
      },
      id_provinsi: {
        type: Sequelize.BIGINT,
      },
      id_kabkota: {
        type: Sequelize.BIGINT,
      },
      id_kecamatan: {
        type: Sequelize.BIGINT,
      },
      id_keldesa: {
        type: Sequelize.BIGINT,
      },

      tgt_hunian: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      jml_unit: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tipe_unit: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      tipologi: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      tower: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      alamat: {
        type: Sequelize.STRING(1000),
        defaultValue: '',
      },
      latitude: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      longitude: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      klpk_pengusul: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      lbg_pengumpul: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      klpk_penerima: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      lbg_penerima: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      jml_lantai: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      myc: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      no_kontrak_pemb: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      tgl_kontrak_pemb: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      satker_pelaksana: {
        type: Sequelize.STRING,
        defaultValue: '',
      },

      nm_kontraktor: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      nm_pengawas_pemb: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      nm_perencana_pemb: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      biaya_pembangunan: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      biaya_pengawasan: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      biaya_perencanaan: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },

      nm_pengembang: Sequelize.STRING,
      asosiasi: Sequelize.STRING,
      nm_perumahan: Sequelize.STRING,
      sumb_dana: Sequelize.STRING,

      thn_anggaran: Sequelize.STRING,
      kode_anggaran: Sequelize.STRING,

      thn_bang: Sequelize.STRING,
      thn_selesaibang: Sequelize.STRING,
      status_penghunian_id: Sequelize.INTEGER,
      thn_huni: Sequelize.STRING,
      jml_unit_huni: Sequelize.INTEGER,
      jml_tower_huni: Sequelize.INTEGER,
      alasan_belum_terhuni: Sequelize.TEXT,
      tanggal_target_terhuni: Sequelize.DATE,

      stat_srh_trm: Sequelize.TEXT,
      id_keterangan_serah_terima: Sequelize.INTEGER,
      keterangan_serah_terima: Sequelize.TEXT,
      no_bast_lainnya: Sequelize.STRING,
      thn_serah_aset: Sequelize.STRING,

      thn_revit: Sequelize.STRING,
      nm_kontraktor_revit: Sequelize.STRING,
      nm_pengawas_revit: Sequelize.STRING,
      nm_perancana_revit: Sequelize.STRING,
      biaya_kontraktor_revit: Sequelize.BIGINT,
      biaya_pengawasan_revit: Sequelize.BIGINT,
      biaya_perncanaan_revit: Sequelize.BIGINT,

      thn_meubel: Sequelize.STRING,
      jumlah_meubel: Sequelize.STRING,
      biaya_meubel: Sequelize.STRING,
      penyedia_meubel: Sequelize.STRING,

      tot_biaya_bang: Sequelize.BIGINT,
      tot_biaya_pengawasan: Sequelize.BIGINT,
      tot_biaya_perencanaan: Sequelize.BIGINT,
      tot_biaya: Sequelize.BIGINT,

      status_opor: Sequelize.BOOLEAN,
      biaya_opor_konstruksi_fisik: Sequelize.INTEGER,
      biaya_opor_perencanaan_konstruksi: Sequelize.INTEGER,
      biaya_opor_pengawasan_konstruksi: Sequelize.INTEGER,
      biaya_opor_pengelolaan_kegiatan: Sequelize.INTEGER,

      ProtypeId: Sequelize.INTEGER,
      ProType: Sequelize.INTEGER,
      pxMasterId: Sequelize.INTEGER,
      id_type: Sequelize.INTEGER,
      type: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      createdBy: Sequelize.INTEGER,
      KelompokPengusulId: Sequelize.INTEGER,
      KondisiBangunanId: Sequelize.INTEGER,

      status_peresmian: Sequelize.BOOLEAN,
      foto: Sequelize.TEXT,
      video: Sequelize.TEXT,
      dokumenST: Sequelize.TEXT,
      dokumenOPOR: Sequelize.TEXT,
      additional_detail_files: Sequelize.TEXT,

      UsulanId: Sequelize.INTEGER,
      Usulan: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('profiles')
  },
}
