const express = require('express')
const router = express.Router()
const models = require('../models')
const moment = require('moment')
const { ErrorHandler } = require('../helpers/error')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const { requireAuth } = require('../helpers')

// Vérification d'autorisation
const checkAuthorization = async (req, res, next) => {
  try {
    const event = await models.Event.findByPk(req.params.id)
    if (!event) {
      return next(new ErrorHandler(404, 'Event not found'))
    }
    
    if (!req.user.isAdmin && req.user.id !== event.userId) {
      return next(new ErrorHandler(403, 'Forbidden'))
    }
    return next()
  } catch (error) {
    return next(new ErrorHandler(400, 'Event could not be found'))
  }
}

// Vérification des droits de réservation
const checkReservationRight = async (user, assoId) => {
  if (user.isAdmin) {
    return true
  }
  try {
    const assos = await user.getAssos({
      where: { id: assoId },
      attributes: ['id'],
      through: {
        attributes: ['hasReservationRight']
      }
    })
    return assos[0]?.AssoUser?.hasReservationRight || false
  } catch (error) {
    return false
  }
}

router.use(requireAuth)

// Route pour obtenir les événements dans une période donnée
router.get('/:start/:end', (req, res, next) => {
  const start = moment(req.params.start)
  const end = moment(req.params.end).add(1, 'day')
  const userAttributes = req.user.isAdmin ? ['id', 'displayName', 'email'] : ['id']

  models.Room.findAll({
    include: [{
      model: models.Event,
      as: 'events',
      required: false,
      attributes: ['id', 'start', 'end', 'details', 'hasHealthPass'],
      where: {
        start: {
          [Op.between]: [start.toDate(), end.toDate()],
        }
      },
      include: [{
        model: models.User,
        as: 'User',
        attributes: userAttributes
      },
      {
        model: models.Asso,
        as: 'Asso',
        attributes: ['id', 'name']
      }]
    }]
  })
  .then((rooms) => {
    res.json(rooms)
  })
  .catch((err) => {
    return next(err)
  })
})

// Route pour créer un événement (événement récurrent ou unique)
router.post('/event', async (req, res, next) => {
  try {
    // Si l'utilisateur est Admin et demande un événement récurrent
    if (req.user.isAdmin && req.body.until) {
      let start = moment(req.body.start)
      let end = moment(req.body.end)
      const until = moment(req.body.until)
      const events = []

      // Construction des événements récurrents
      while (start.isSameOrBefore(until, 'day')) {
        const event = models.Event.build({
          start: start.toDate(),
          end: end.toDate(),
          details: req.body.details,
          hasHealthPass: req.body.hasHealthPass
        })
        event.setAsso(req.body.assoId, { save: false })
        event.setRoom(req.body.roomId, { save: false })
        event.setUser(req.user.id, { save: false })

        events.push(event)

        start.add(7, 'day')
        end.add(7, 'day')
      }

      // Insertion des événements dans une transaction
      await models.sequelize.transaction(async (t) => {
        await Promise.all(events.map(e => e.save({ transaction: t })))
      })

      return res.status(200).send()
    } else {
      // Création d'un événement unique
      const event = models.Event.build({
        start: req.body.start,
        end: req.body.end,
        details: req.body.details,
        hasHealthPass: req.body.hasHealthPass
      })

      if (req.body.assoId) {
        const hasRight = await checkReservationRight(req.user, req.body.assoId)
        if (!hasRight) {
          return next(new ErrorHandler(403, 'Vous ne pouvez pas réserver au nom de cette assos.'))
        }
        event.setAsso(req.body.assoId, { save: false })
      }

      event.setRoom(req.body.roomId, { save: false })
      event.setUser(req.user.id, { save: false })
      await event.save()

      return res.status(200).send()
    }
  } catch (err) {
    return next(err)
  }
})

// Route pour modifier un événement
router.patch('/event/:id', checkAuthorization, async (req, res, next) => {
  try {
    const event = await models.Event.findByPk(req.params.id)

    if (!event) {
      return next(new ErrorHandler(404, 'Event not found'))
    }

    // Modification de l'événement pour l'association
    if (req.body.assoId) {
      const hasRight = await checkReservationRight(req.user, req.body.assoId)
      if (!hasRight) {
        return next(new ErrorHandler(403, 'Vous ne pouvez pas réserver au nom de cette assos.'))
      }
      event.setAsso(req.body.assoId, { save: false })
    }

    event.setRoom(req.body.roomId, { save: false })
    event.start = req.body.start
    event.end = req.body.end
    event.details = req.body.details

    await event.save()

    return res.status(200).send()
  } catch (err) {
    return next(err)
  }
})

// Route pour supprimer un événement
router.delete('/event/:id', checkAuthorization, async (req, res, next) => {
  try {
    const event = await models.Event.findByPk(req.params.id)

    if (!event) {
      return next(new ErrorHandler(404, 'Event not found'))
    }

    await event.destroy()
    return res.status(200).send()
  } catch (err) {
    return next(err)
  }
})

// Route pour créer une salle
router.post('/', (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler(403, 'Insufficient privileges'))
  }

  const required = ['name', 'color']
  const missing = required.filter(item => !req.body[item])

  if (missing.length > 0) {
    return next(new ErrorHandler(400, `Missing parameters ${missing.join(',')}`))
  }

  const room = models.Room.build({
    name: req.body.name,
    color: req.body.color
  })

  room.save()
    .then(() => {
      res.status(200).send()
    })
    .catch(err => {
      return next(err)
    })
})

module.exports = router
