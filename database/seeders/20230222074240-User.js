'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'johndoe@mail.com',
        password: 'qwerty123',
        fullname: 'John Doe',
        phone: '08579012579',
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'janedoe@mail.com',
        password: 'qwerty123',
        fullname: 'Jane Doe',
        phone: '08590253723',
        role_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
