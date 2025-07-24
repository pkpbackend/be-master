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
    await queryInterface.addColumn('profiles', 'nup', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'kategoriBarang', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'noDipa', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'tglDipa', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('profiles', 'nup')
    await queryInterface.removeColumn('profiles', 'kategoriBarang')
    await queryInterface.removeColumn('profiles', 'noDipa')
    await queryInterface.removeColumn('profiles', 'tglDipa')
  },
}
