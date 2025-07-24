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
    await queryInterface.createTable('perusahaans', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },

      name: Sequelize.STRING,
      asosiasi: Sequelize.STRING,
      alamat: Sequelize.STRING,
      kodePos: Sequelize.STRING,
      rtRw: Sequelize.STRING,
      namaDirektur: Sequelize.STRING,
      telpKantor: Sequelize.STRING,
      telpDirektur: Sequelize.STRING,
      telpPenanggungJawab: Sequelize.STRING,
      email: Sequelize.STRING,
      website: Sequelize.STRING,
      npwp: Sequelize.STRING,
      ProvinsiId: Sequelize.INTEGER,
      CityId: Sequelize.INTEGER,
      DesaId: Sequelize.BIGINT,
      KecamatanId: Sequelize.INTEGER,
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('perusahaans')
  },
}
