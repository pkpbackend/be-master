'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('masterdokumens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jenisData: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jenisDirektif: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      required: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      MasterKategoriDokumenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      maxSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      typeFile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ditRusunField: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      jenisBantuan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sort: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      formatDokumen: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('masterdokumens');
  },
};