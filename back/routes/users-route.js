const express = require('express')
const router = express.Router()
const models = require('../models')
const { requireAuth } = require('../helpers')

router.use(requireAuth)
router.get('/me', async (req, res, next) => {
  try {
    let assos;
    if (req.user.isAdmin) {
      assos = await models.Asso.findAll();
      assos = assos.map((asso) => ({
        id: asso.id,
        name: asso.name,
        hasReservationRight: true
      }));
    } else {
      assos = await req.user.getAssos({
        attributes: ['id', 'name'],
        through: {
          attributes: ['hasReservationRight']
        }
      });
      assos = assos.map((asso) => ({
        id: asso.id,
        name: asso.name,
        hasReservationRight: asso.AssoUser.hasReservationRight
      }));
    }

    const user = {
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      isMu0x: req.user.isMu0x
    };

    // Envoie la réponse une seule fois
    res.json({
      ...user,
      assos
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    // Utilise `next(error)` pour transmettre l'erreur à un middleware de gestion des erreurs
    next(error);
  }
});


module.exports = router
