'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emontables', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kode: {
        type: Sequelize.STRING
      },
      kdsatker: {
        type: Sequelize.STRING
      },
      nmsatker: {
        type: Sequelize.STRING
      },
      kdprog: {
        type: Sequelize.STRING
      },
      nmprogram: {
        type: Sequelize.STRING
      },
      kdgiat: {
        type: Sequelize.STRING
      },
      nmgiat: {
        type: Sequelize.STRING
      },
      kdoutput: {
        type: Sequelize.STRING
      },
      nmoutput: {
        type: Sequelize.STRING
      },
      kdpaket: {
        type: Sequelize.STRING
      },
      kdspaket: {
        type: Sequelize.STRING
      },
      nmpaket: {
        type: Sequelize.STRING
      },
      target: {
        type: Sequelize.STRING
      },
      pengadaan: {
        type: Sequelize.STRING
      },
      jenis_paket: {
        type: Sequelize.STRING
      },
      
      pagu: { type: Sequelize.STRING },
      pagurpm: { type: Sequelize.STRING },
      pagusbsn: { type: Sequelize.STRING },
      paguphln: { type: Sequelize.STRING },

      realisasi: { type: Sequelize.STRING },
      realisasirpm: { type: Sequelize.STRING },
      realisasisbsn: { type: Sequelize.STRING },
      realisasiphln: { type: Sequelize.STRING },

      progreskeu: {
        type: Sequelize.STRING
      },
      progresfis: {
        type: Sequelize.STRING
      },
      tglkirim: {
        type: Sequelize.DATE
      },
      rekanan: {
        type: Sequelize.STRING
      },
      tglmulai: {
        type: Sequelize.DATE
      },
      tglselesai: {
        type: Sequelize.DATE
      },
      ProvinsiId: { type: Sequelize.INTEGER },
      provinsi: {
        type: Sequelize.STRING
      },
      KabkotaId: { type: Sequelize.INTEGER },
      kabupaten: {
        type: Sequelize.STRING
      },
      kdlokasi: {
        type: Sequelize.STRING
      },
      kdkabkota: {
        type: Sequelize.STRING
      },
      nilai_kontrak: {
        type: Sequelize.STRING
      },
      fotos: {
        type: Sequelize.TEXT
      },
      rekanans: {
        type: Sequelize.TEXT
      },
      field26: {
        type: Sequelize.STRING
      },
      thang: {
        type: Sequelize.STRING
      },
      additional: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      prognosisKeuangan: { type: Sequelize.FLOAT(18, 2) },
      prognosisPresentaseKeuangan: { type: Sequelize.FLOAT(18, 2) },
      prognosisPresentaseFisik: { type: Sequelize.FLOAT(18, 2) },
      deviasiPresentaseKeuangan: { type: Sequelize.FLOAT(18, 2) },
      deviasiPresentaseFisik: { type: Sequelize.FLOAT(18, 2) },
      rencanaTindakLanjut: { type: Sequelize.TEXT },
      metodePemilihan: { type: Sequelize.STRING },
      jenisKontrak: { type: Sequelize.STRING },
      kdmetode: { type: Sequelize.STRING },
      metode: { type: Sequelize.STRING },
      
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('emontables')
  },
}
