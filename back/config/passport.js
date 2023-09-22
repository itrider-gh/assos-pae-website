const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const models = require('../models')
const axios = require('axios')
const config = require('./index')
const Op = require('sequelize').Op

axios.defaults.baseURL = `${config.hosts.api}/api`

let client = new OAuth2Strategy({
  authorizationURL: `${config.hosts.api}/oauth/authorize`,
  tokenURL: `${config.hosts.api}/oauth/token`,
  clientID: config.api.clientID,
  clientSecret: config.api.clientSecret,
  callbackURL: `${config.hosts.back}/auth/redirect`,
  scope: ['users-infos', 'read-assos'],
}, (accessToken, refreshToken, profile, done) => {
  models.User.findOrCreate({
    where: {id: profile.uuid}, defaults: {
      displayName: `${profile.firstName} ${profile.lastName}`, email: profile.email, accessToken, refreshToken
    }
  })
      .then(async ([user, created]) => {
        // Updating API tokens
        user.accessToken = accessToken
        user.refreshToken = refreshToken
        user.displayName =  `${profile.firstName} ${profile.lastName}`
        user.save()
        // Updating Assos
        try {
            // Get user assos from API
          const assosUser = (await axios.get('/user/associations/current', {headers: {'Authorization': 'Bearer ' + accessToken}})).data
          const assosUserIds = assosUser.map(asso => asso.id)

          // check if user is in poleae asso that is not present in local db
          const paeAssos = assosUser //.filter(asso => asso.parent.login === 'poleae')
          const existingPaeAssosIds = await models.Asso.findAll({
            where: {
              id: {
                [Op.in]: paeAssos.map(asso => asso.id)
              }
            }, attributes: ['id']
          }).then(assos => assos.map(a => a.id))
          // Create PAE Assos if needed
          const assosToCreate = paeAssos.filter(asso => !existingPaeAssosIds.includes(asso.id))

          for (const asso of assosToCreate) {
            console.log(`Adding ${asso.shortname} to database`)
            await models.Asso.create({
              id: asso.id, name: asso.shortname
            })
          }

          const assosCorresponding = await models.Asso.findAll({
            where: {
              id: {
                [Op.in]: assosUserIds
              }
            }
          })
          user.addAssos(assosCorresponding)
        } catch (error) {
          done(error, null)
        }

        done(null, user)
      })
})

client.userProfile = async (accessToken, done) => {
  try {
    const profile = (await axios.get('/user', {headers: {'Authorization': 'Bearer ' + accessToken}})).data
    done(null, profile)
  } catch (error) {
    done(error, null)
  }
}

passport.use(client)

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  models.User.findByPk(id).then((user) => {
    done(null, user)
  })
})

module.exports = passport
