const express = require('express');
const http = require('http'); // Remplace https par http
const fs = require('fs');
const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const assosRouter = require('./routes/assos-routes');
const roomsRouter = require('./routes/rooms-route');
const usersRouter = require('./routes/users-route');
const authRouter = require('./routes/auth-route');

const passport = require('./config/passport');
const session = require('./config')['session'];
const { handleError } = require('./helpers/error');
const config = require('./config');

// Options pour CORS (autoriser certaines origines)
var corsOptions = {
  origin: [config.hosts.front, 'http://192.168.1.55:3000'], // Mettez HTTP à la place de HTTPS
  credentials: true, // Autorise l'envoi des cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Autorise les en-têtes spécifiques
  optionsSuccessStatus: 200 // Réponse correcte pour les requêtes OPTIONS prévol
};
app.use(cors(corsOptions));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [session.cookieKey],
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
  secure: false, // Désactivez secure pour HTTP
  sameSite: 'Lax', // Ajustez pour HTTP
  httpOnly: true // Protège contre l'accès aux cookies via JavaScript côté client
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRouter);
app.use('/api/assos', assosRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/users', usersRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  handleError(err, res);
});

// Suppression du socket si déjà existant
if (fs.existsSync(config.app.listenOn)) {
  console.warn('WARN: Unlink socket, is another instance running?');
  fs.unlinkSync(config.app.listenOn);
}

// Création du serveur HTTP
http.createServer(app).listen(config.app.listenOn, () => {
  // Définir les permissions sur le socket (si nécessaire)
  if (fs.existsSync(config.app.listenOn)) {
    console.log('Set permissions on socket');
    fs.chmodSync(config.app.listenOn, '775');
  }
  console.log('Listening on HTTP ' + config.app.listenOn);
});
