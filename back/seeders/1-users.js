'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      id: '45617374-6572-2065-6767-7321202b5f2b',
      isAdmin: true,
      isMu0x: false,
      displayName: 'Loïc JUMEL',
      email: 'loic.jumel@utc.fr',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
