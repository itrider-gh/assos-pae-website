'use strict';
module.exports = (sequelize, DataTypes) => {
  const AssoUser = sequelize.define('AssoUser', { // Nom du modèle sans le 's'
    hasReservationRight: DataTypes.BOOLEAN
  }, {
    tableName: 'AssoUsers' // Nom physique de la table si nécessaire
  });

  AssoUser.associate = function(models) {
    // Pas besoin d'associations supplémentaires ici, elles sont définies dans Asso et User
  };

  return AssoUser;
};
