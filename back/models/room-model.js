'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING
    },
    color: {
      type: DataTypes.STRING
    }
  }, {});
  
  Room.associate = function(models) {
    Room.hasMany(models.Event, {
      foreignKey: 'roomId', // Assure-toi que ce nom correspond à la colonne dans la table `Events`
      as: 'events' // Optionnel: pour nommer l'association
    });
  };
  
  return Room;
};
