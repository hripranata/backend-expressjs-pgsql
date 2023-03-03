'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Permissions', [
      {
        id: 1,
        perm_name: 'VIEW_USER',
        perm_description: 'can show one / all user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        perm_name: 'EDIT_USER',
        perm_description: 'can delete user data',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
