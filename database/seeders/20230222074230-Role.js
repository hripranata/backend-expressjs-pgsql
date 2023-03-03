'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        id: 1,
        role_name: 'admin',
        role_description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        role_name: 'staff',
        role_description: 'Staff role',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
