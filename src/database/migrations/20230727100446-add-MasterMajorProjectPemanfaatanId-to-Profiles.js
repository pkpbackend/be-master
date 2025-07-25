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

    await queryInterface.addColumn(
      'profiles',
      'MasterMajorProjectPemanfaatanId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'mastermajorprojectpemanfaatans',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        allowNull: true,
        after: 'id_provinsi',
      }
    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn(
      'profiles',
      'MasterMajorProjectPemanfaatanId'
    )
  },
}
