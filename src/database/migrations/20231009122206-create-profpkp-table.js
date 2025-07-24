'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profpkps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ProvinsiId: Sequelize.INTEGER,
      CityId: Sequelize.INTEGER,
      nama: Sequelize.STRING,
      type: Sequelize.STRING,
      status: Sequelize.STRING,
      skPKPPermen: Sequelize.STRING,
      skPKPNonPermen: Sequelize.STRING,
      noSkPembentukan: Sequelize.TEXT,
      tglSk: Sequelize.DATE,
      tglSkHingga: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profpkps')
  },
}
