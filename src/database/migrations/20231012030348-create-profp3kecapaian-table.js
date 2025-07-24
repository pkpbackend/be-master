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
    await queryInterface.createTable('profp3kecapaians', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProvinsiId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      KabupatenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      periode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      djpReguler: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      djpNahp: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      baznasKomplementer: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      baznasUnitKeseluruhan: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('profp3kecapaians')
  },
}
