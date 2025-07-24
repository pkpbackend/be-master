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

    await queryInterface.createTable('kegiatanopors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProfileId: Sequelize.INTEGER,
      MasterKegiatanOPORId: Sequelize.INTEGER,
      namaKontraktorKonsultan: Sequelize.STRING,
      anggaran: Sequelize.FLOAT(22, 2),
      biaya_konstruksi_fisik: Sequelize.DECIMAL(25, 2),
      biaya_perencanaan_konstruksi: Sequelize.DECIMAL(25, 2),
      biaya_pengawasan_konstruksi: Sequelize.DECIMAL(25, 2),
      biaya_pengelolaan_kegiatan: Sequelize.DECIMAL(25, 2),
      tahun: Sequelize.INTEGER,
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

    await queryInterface.dropTable('kegiatanopors')
  },
}
