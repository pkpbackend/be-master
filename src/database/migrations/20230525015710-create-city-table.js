'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama: Sequelize.STRING,
      ProvinsiId: Sequelize.INTEGER,
      backlog: Sequelize.FLOAT,
      rtlh: Sequelize.FLOAT,
      latitude: Sequelize.STRING,
      longitude: Sequelize.STRING,
      zoom: Sequelize.STRING,
      geojson: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      kode_dagri: Sequelize.STRING,
      kode_bps: Sequelize.STRING,
      kode_rkakl: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cities')
  },
}
