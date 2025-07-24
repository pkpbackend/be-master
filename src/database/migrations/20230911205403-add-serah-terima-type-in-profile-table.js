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
    await queryInterface.addColumn('profiles', 'serahTerimaStatus', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'serahTerimaType', {
      type: Sequelize.STRING,
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
    await queryInterface.removeColumn('profiles', 'serahTerimaStatus')
    await queryInterface.removeColumn('profiles', 'serahTerimaType')
  },
}
