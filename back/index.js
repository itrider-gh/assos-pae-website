const express = require('express');
const https = require('https');
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
  origin: [config.hosts.front, 'https://192.168.1.55:3000'],
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
  secure: true, // Utilisez 'true' pour HTTPS afin de sécuriser le cookie
  sameSite: 'None', // Important pour l'envoi des cookies via requêtes cross-origin
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

// Chargement des certificats SSL (Let's Encrypt ou autre)
const httpsOptions = {
  key: fs.readFileSync('selfsigned.key'),   // Clé privée
  cert: fs.readFileSync('selfsigned.crt') // Certificat SSL
};

// Suppression du socket si déjà existant
if (fs.existsSync(config.app.listenOn)) {
  console.warn('WARN: Unlink socket, is another instance running?');
  fs.unlinkSync(config.app.listenOn);
}

// Création du serveur HTTPS
https.createServer(httpsOptions, app).listen(config.app.listenOn, () => {
  // Définir les permissions sur le socket (si nécessaire)
  if (fs.existsSync(config.app.listenOn)) {
    console.log('Set permissions on socket');
    fs.chmodSync(config.app.listenOn, '775');
  }
  console.log('Listening on HTTPS ' + config.app.listenOn);
});
