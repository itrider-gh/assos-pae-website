const express = require('express')
const router = express.Router()
const models = require('../models')
const {ErrorHandler} = require('../helpers/error')
const {requireAuth} = require('../helpers')

router.get('/', (req, res, next) => {
  models.Asso.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  })
    .then((assos) => {
      res.json(assos)
    })
    .error((err) => {
      return next(err)
    })
})

router.use(requireAuth)
router.get('/:id/members', (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler(403, 'Forbidden'))
  }
  models.Asso.findByPk(req.params.id, {
    include: [
      {
        model: models.User,
        attributes: ['id', 'displayName']
      }
    ]
  })
    .then(asso => {
      res.json(asso.Users.map(u => ({
        id: u.id,
        displayName: u.displayName,
        hasReservationRight: u.AssoUser.hasReservationRight
      })))
        .catch(error => {next(error)})
    })
})


router.patch('/:assoid/members/:userid', async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ErrorHandler(403, 'Forbidden'))
  }
  const asso_user = await models.AssoUser.findOne({
    where: {
      assoId: req.params.assoid,
      userId: req.params.userid
    }
  })
  asso_user.hasReservationRight = req.body.hasReservationRight || false
  asso_user.save()
    .then(data => res.json(data))
    .catch(error => {next(error)})
})

module.exports = router
