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
    await queryInterface.addColumn('profiles', 'kegiatan', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'output', {
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
    await queryInterface.removeColumn('profiles', 'kegiatan')
    await queryInterface.removeColumn('profiles', 'output')
  },
}
