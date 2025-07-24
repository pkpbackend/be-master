'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('profiles', 'UserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    }) 
    await queryInterface.addColumn('profiles', 'User', {
      type: Sequelize.JSON,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('profiles', 'UserId')
    await queryInterface.removeColumn('profiles', 'User')
  }
};
