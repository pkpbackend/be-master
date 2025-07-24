'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('profiles', 'kodeWilayah', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('provinsis', 'kodeWilayah', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('profiles', 'kodeWilayah')
    await queryInterface.removeColumn('provinsis', 'kodeWilayah')
  }
};
