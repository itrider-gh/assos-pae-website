const express = require('express')
const router = express.Router()
const models = require('../models')
const { ErrorHandler } = require('../helpers/error')
const { requireAuth } = require('../helpers')

// Route pour obtenir toutes les associations
router.get('/', (req, res, next) => {
  models.Asso.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  })
    .then((assos) => {
      res.json(assos)
    })
    .catch((err) => {
      next(err) // Utilisation correcte de catch au lieu de error
    })
})

// Middleware d'authentification
router.use(requireAuth)

// Route pour obtenir les membres d'une association
router.get('/:id/members', (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler(403, 'Forbidden'))
  }
  
  models.Asso.findByPk(req.params.id, {
    include: [
      {
        model: models.User,
        as: 'users',
        attributes: ['id', 'displayName']
      }
    ]
  })
  .then(asso => {
    if (!asso) {
      return next(new ErrorHandler(404, 'Association not found'))
    }

    res.json(asso.users.map(u => ({
      id: u.id,
      displayName: u.displayName,
      hasReservationRight: u.AssoUser.hasReservationRight
    })))
  })
  .catch(error => next(error)) // Suppression de la double inclusion du catch
})

// Route pour modifier les droits de réservation d'un membre
router.patch('/:assoid/members/:userid', async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler(403, 'Forbidden'))
  }

  try {
    const asso_user = await models.AssoUser.findOne({
      where: {
        assoId: req.params.assoid,
        userId: req.params.userid
      }
    })
    
    if (!asso_user) {
      return next(new ErrorHandler(404, 'User not found in association'))
    }

    asso_user.hasReservationRight = req.body.hasReservationRight || false
    const updatedAssoUser = await asso_user.save()
    
    res.json(updatedAssoUser)
  } catch (error) {
    next(error)
  }
})

module.exports = router
