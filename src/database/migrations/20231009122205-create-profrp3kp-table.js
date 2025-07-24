'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profrp3kps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProvinsiId: Sequelize.INTEGER,
      CityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      statusBelumBelumDianggarkan: Sequelize.STRING,
      statusBelumSudahDianggarkan: Sequelize.STRING,
      statusSedangPersiapan: Sequelize.STRING,
      statusSedangPenyusunanProfil: Sequelize.STRING,
      statusSedangPenyusunanRencana: Sequelize.STRING,
      statusSudahReviewDokumen: Sequelize.STRING,
      statusSudahReviewDokumenTahun: Sequelize.STRING,
      statusSudahProlegda: Sequelize.STRING,
      statusSudahLegalisasiNomor: Sequelize.STRING,
      alokasiAnggaran: Sequelize.BIGINT,
      alokasiAnggaranNotes: Sequelize.STRING,
      jenisAnggaran: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profrp3kps')
  },
}
