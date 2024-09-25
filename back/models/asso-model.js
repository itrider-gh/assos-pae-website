'use strict';
module.exports = (sequelize, DataTypes) => {
  const Asso = sequelize.define('Asso', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  Asso.associate = function(models) {
    // Relation One-to-Many avec Event
    Asso.hasMany(models.Event, { 
      foreignKey: 'assoId',
      as: 'events'
    });

    // Relation Many-to-Many avec User via AssoUser
    Asso.belongsToMany(models.User, {
      through: models.AssoUser, // Nom correct du modèle
      foreignKey: 'assoId',
      otherKey: 'userId',
      as: 'users'
    });
  };

  return Asso;
};
