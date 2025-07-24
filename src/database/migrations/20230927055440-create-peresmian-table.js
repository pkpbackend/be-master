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
    await queryInterface.createTable('peresmians', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      jenis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lokasi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ProvinsiId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      CityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      masaPelaksanaan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      biaya: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      tower: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lantai: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tipe: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
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
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('peresmians')
  },
}
