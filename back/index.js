const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const assosRouter = require('./routes/assos-routes')
const roomsRouter = require('./routes/rooms-route')
const usersRouter = require('./routes/users-route')
const authRouter = require('./routes/auth-route')

const passport = require('./config/passport')

const session = require('./config')['session']
const { handleError } = require('./helpers/error')
const config = require('./config')
const fs = require('fs')

var corsOptions = {
  origin: [config.hosts.front, 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession({
  keys: [session.cookieKey]}
))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRouter)
app.use('/api/assos', assosRouter)
app.use('/api/rooms', roomsRouter)
app.use('/api/users', usersRouter)

app.use((err, req, res, next) => {
  handleError(err, res)
})

/**
 * Supposes onlu 1 node process listens on the socket
 */
if (fs.existsSync(config.app.listenOn)) {
  console.warn('WARN : Unlink socket, is another instance running ?')
  fs.unlinkSync(config.app.listenOn)
}

app.listen(config.app.listenOn, () => {
  // Set socket permissions if file exists
  if (fs.existsSync(config.app.listenOn)) {
    console.log('Set permissions on socket')
    fs.chmodSync(config.app.listenOn, '775')
  }
  console.log('Listening on ' + config.app.listenOn)
})

