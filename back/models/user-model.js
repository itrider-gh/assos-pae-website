'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accessToken: {
      type: DataTypes.TEXT, // Changement en TEXT pour supporter de longues chaînes
    },
    refreshToken: {
      type: DataTypes.TEXT, // Changement en TEXT pour supporter de longues chaînes
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true  // Validation pour s'assurer que c'est un email valide
      }
    },
    isMu0x: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {})

  User.associate = function(models) {
    // Un utilisateur peut avoir plusieurs événements
    User.hasMany(models.Event)

    // Relation Many-to-Many avec Asso via AssoUser
    User.belongsToMany(models.Asso, { 
      through: models.AssoUser, 
      foreignKey: 'userId',
      otherKey: 'assoId'
    })
  }

  return User
}
