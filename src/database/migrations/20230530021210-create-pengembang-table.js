'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pengembangs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      namaPerusahaan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telpPenanggungJawab: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      npwp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fileNpwp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      IdPengembangSikumbang: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pengembangs');
  },
};