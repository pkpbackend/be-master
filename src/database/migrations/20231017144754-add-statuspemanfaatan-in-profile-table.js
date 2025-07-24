'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('profiles', 'pemanfaatanStatus', {
      type: Sequelize.INTEGER,
      allowNull: true,
    }) 
    await queryInterface.addColumn('profiles', 'pemanfaatanStatusData', {
      type: Sequelize.JSON,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('profiles', 'pemanfaatanStatus')
    await queryInterface.removeColumn('profiles', 'pemanfaatanStatusData')
  }
};
