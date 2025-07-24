'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emondetails', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      EmonTableId: {
        type: Sequelize.INTEGER,
      },
      TematikId: {
        type: Sequelize.INTEGER,
      },
      alamat: {
        type: Sequelize.STRING,
      },
      tipe: {
        type: Sequelize.STRING,
      },
      tower: {
        type: Sequelize.INTEGER,
      },
      unit: {
        type: Sequelize.INTEGER,
      },
      koordX: {
        type: Sequelize.FLOAT(11, 7),
      },
      koordY: {
        type: Sequelize.FLOAT(11, 7),
      },
      kontraktor: {
        type: Sequelize.STRING,
      },
      tanggalKontrakKontraktor: {
        type: Sequelize.DATE,
      },
      nilaiKontrakKontraktor: {
        type: Sequelize.BIGINT,
      },
      mk: {
        type: Sequelize.STRING,
      },
      tanggalKontrakMk: {
        type: Sequelize.DATE,
      },
      nilaiKontrakMk: {
        type: Sequelize.BIGINT,
      },
      totalWaktuPelaksanaan: {
        type: Sequelize.INTEGER,
      },
      waktuBerjalanPelaksanaan: {
        type: Sequelize.INTEGER,
      },
      sisahWaktuPelaksanaan: {
        type: Sequelize.INTEGER,
      },
      pekerjaanSaatIni: {
        type: Sequelize.TEXT,
      },
      permasalahan: {
        type: Sequelize.TEXT,
      },
      tindakLanjut: {
        type: Sequelize.TEXT,
      },
      foto: {
        type: Sequelize.TEXT,
      },
      kurvaS: {
        type: Sequelize.TEXT,
      },
      video: {
        type: Sequelize.TEXT,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('emondetails')
  },
}
