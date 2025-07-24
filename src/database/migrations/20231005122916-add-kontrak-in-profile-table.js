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
    await queryInterface.addColumn('profiles', 'kontrakFisikBangunanRumah', {
      type: Sequelize.JSON,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'kontrakPsu', {
      type: Sequelize.JSON,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'kontrakMebel', {
      type: Sequelize.JSON,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'kontrakPerencana', {
      type: Sequelize.JSON,
      allowNull: true,
    })
    await queryInterface.addColumn('profiles', 'kontrakPengawas', {
      type: Sequelize.JSON,
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
    await queryInterface.removeColumn('profiles', 'kontrakFisikBangunanRumah')
    await queryInterface.removeColumn('profiles', 'kontrakPsu')
    await queryInterface.removeColumn('profiles', 'kontrakMebel')
    await queryInterface.removeColumn('profiles', 'kontrakPerencana')
    await queryInterface.removeColumn('profiles', 'kontrakPengawas')
  },
}
