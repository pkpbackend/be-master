'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emonfotos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      kdsatker: {
        type: Sequelize.STRING
      },
      kdpaket: {
        type: Sequelize.STRING
      },
      kdspaket: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.STRING
      },
      longitude: {
        type: Sequelize.STRING
      },
      keterangan: {
        type: Sequelize.STRING
      },
      linkfoto1: {
        type: Sequelize.STRING
      },
      linkfoto2: {
        type: Sequelize.STRING
      },
      linkfoto3: {
        type: Sequelize.STRING
      },
      linkfoto4: {
        type: Sequelize.STRING
      },
      linkfoto5: {
        type: Sequelize.STRING
      },
      kode: {
        type: Sequelize.STRING
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('emonfotos')
  },
}
