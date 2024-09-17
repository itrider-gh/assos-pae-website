'use strict';
module.exports = (sequelize, DataTypes) => {
  const Asso = sequelize.define('Asso', {
    id: {
      type: DataTypes.UUID,      // Utilisation de UUID pour l'ID
      defaultValue: DataTypes.UUIDV4,  // Génération automatique de UUID v4
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false           // Le champ name est requis
    }
  }, {});

  // Définition des associations
  Asso.associate = function(models) {
    // Relation One-to-Many avec Event
    Asso.hasMany(models.Event, { 
      foreignKey: 'assoId',      // Clé étrangère dans la table Event
      as: 'events'               // Alias pour faciliter l'accès
    });

    // Relation Many-to-Many avec User via AssoUser
    Asso.belongsToMany(models.User, {
      through: models.AssoUser,   // Table de jointure AssoUser
      foreignKey: 'assoId',       // Clé étrangère dans AssoUser pour Asso
      otherKey: 'userId',         // Clé étrangère pour User dans AssoUser
      as: 'users'                 // Alias pour faciliter l'accès
    });
  };

  return Asso;
};
