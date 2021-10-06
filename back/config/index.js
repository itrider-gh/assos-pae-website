require('dotenv').config()
const env = process.env.NODE_ENV || 'development'
let config = {}

if (env === 'development') {
  config =  {
    app: {
      listenOn: 3001
    },
    hosts: {
      front: 'http://localhost:3000',
      back: 'http://localhost:3001',
      api: 'http://127.0.0.1:8000',
    },
    api: {
      clientID: '53616d79-206a-6520-7427-61696d652021',
      clientSecret: 'password',
    },
    db: {
      username: 'postgres',
      password: 'root',
      name: 'pae',
      host: 'localhost',
      port: '5432',
      dialect: 'postgres',
      dialectModule: 'pg'
    },
    session: {
      cookieKey: 'F4&^HYX8i*E&rzK#G5d^U5Zfqu!njxoVbMVjYckrSDNXq9hTZygx2J5q*'
    }
  }
}
else if (env === 'production') {
  config = {
    app: {
      listenOn: process.env.SOCKETORPORT,
    },
    hosts: {
      front: process.env.FRONT_HOST,
      back: process.env.BACK_HOST,
      api: process.env.API_HOST,
    },
    api: {
      clientID: process.env.PORTAIL_CLIENT_ID,
      clientSecret: process.env.PORTAIL_PASSWORD,
    },
    db: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      host: process.env.DB_HOSTNAME,
      port: process.env.DB_PORT,
      dialect: 'mysql'
    },
    session: {
      cookieKey: process.env.COOKIE_KEY
    }
  }
}

config.env = env

module.exports = config
