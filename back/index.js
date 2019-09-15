const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const roomsRouter = require('./routes/rooms-route')
const usersRouter = require('./routes/users-route')
const authRouter = require('./routes/auth-route')

const passport = require('./config/passport')

const keys = require('./config/keys')
var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession({
  maxAge: 24*60*60*1000,
  keys: [keys.session.cookieKey]}
));
app.use(passport.initialize())
app.use(passport.session())

app.use('/rooms', roomsRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)

app.listen(3001, () => {
  console.log('Listening on port 3001')
})
