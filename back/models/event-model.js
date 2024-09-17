'use strict';
const moment = require('moment');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    details: DataTypes.STRING,
    hasHealthPass: DataTypes.BOOLEAN,
    start: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter: {
          args: [moment().format('YYYY-MM-DD')],
          msg: 'L\'évènement est dans le passé'
        }
      },
      get() {
        return moment(this.getDataValue('start')).format('YYYY-MM-DD HH:mm');
      }
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue('end')).format('YYYY-MM-DD HH:mm');
      }
    },
  }, {
    validate: {
      hasValidHealthPass() {
        if (!this.hasHealthPass && !this.assoId) {
          throw new Error('La possession d\'un pass sanitaire valide est obligatoire');
        } else if (!this.hasHealthPass) {
          throw new Error('L\'engagement de vérification des pass sanitaires est obligatoire');
        }
      },
      startIsBeforeEnd() {
        if (moment(this.start).isSameOrAfter(moment(this.end))) {
          throw new Error('Le début de l\'évènement ne peut pas être après sa fin.');
        }
      },
      sameDay() {
        if (!moment(this.start).isSame(this.end, 'day')) {
          throw new Error('Le début et la fin de l\'évènement doivent être le même jour.');
        }
      },
      notASunday() {
        if (moment(this.start).day() === 0) {
          throw new Error('Vous ne pouvez pas faire de réservation un Dimanche.');
        }
      },
      futurLimit() {
        if (!this.assoId && moment().add(3, 'week').isBefore(moment(this.start), 'day')) {
          throw new Error('Les réservations individuelles ne peuvent pas être plus de 3 semaines dans le futur.');
        }
      },
      async noCollision() {
        const myStart = moment(this.start).add(1, 'minute').toDate();
        const myEnd = moment(this.end).subtract(1, 'minute').toDate();
        const events = await Event.findAll({
          where: {
            [Op.or]: [
              {
                [Op.or]: [
                  { start: { [Op.between]: [myStart, myEnd] } },
                  { end: { [Op.between]: [myStart, myEnd] } }
                ]
              },
              {
                [Op.and]: [
                  { start: { [Op.lt]: myStart } },
                  { end: { [Op.gt]: myEnd } }
                ]
              }
            ],
            roomId: this.roomId,
            id: {
              [Op.ne]: this.id
            }
          }
        });
        if (events.length > 0) {
          throw new Error('Il y a déjà une réservation sur ce créneau.');
        }
      },
      async maxHoursPerWeek() {
        if (!this.assoId) {
          const message = 'Les réservations individuelles sont limitées à 3h par semaine.';
          let minutes = moment(this.end).diff(moment(this.start), 'minutes');
          if (minutes > 180) {
            throw new Error(message);
          }

          const startOfWeek = moment(this.start).startOf('week');
          const endOfWeek = moment(this.start).endOf('week');
          const user = await this.getUser();
          const events = await user.getEvents({
            where: {
              id: { [Op.ne]: this.id },
              start: { [Op.gte]: startOfWeek.toDate() },
              end: { [Op.lte]: endOfWeek.toDate() },
              assoId: { [Op.is]: null }
            }
          });
          events.forEach(e => {
            minutes += moment(e.end).diff(moment(e.start), 'minutes');
          });
          if (minutes > 180) {
            throw new Error(message);
          }
        }
      }
    }
  });

  Event.associate = function(models) {
    Event.belongsTo(models.User, { as: 'User', foreignKey: 'userId' });
    Event.belongsTo(models.Room, { as: 'Room', foreignKey: 'roomId' });
    Event.belongsTo(models.Asso, { as: 'Asso', foreignKey: 'assoId' });
  };

  return Event;
};
