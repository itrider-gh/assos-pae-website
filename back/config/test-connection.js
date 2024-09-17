const { Sequelize } = require('sequelize');

// Configuration de la connexion à PostgreSQL avec Sequelize
const sequelize = new Sequelize('pae', 'postgres', 'root', {
  host: '127.0.0.1',
  dialect: 'postgres',
  port: 5432,
  logging: console.log,  // Optionnel, affiche les logs SQL dans la console
  dialectOptions: {
    ssl: false,           // SSL désactivé (ajustez selon votre environnement)
  }
});

console.log('Tentative de connexion à PostgreSQL avec Sequelize...');

// Test de la connexion à la base de données PostgreSQL
sequelize.authenticate()
  .then(() => {
    console.log('Connexion réussie à PostgreSQL avec Sequelize');

    // Exécution d'une requête simple pour tester la connexion
    return sequelize.query('SELECT NOW()');
  })
  .then(([results, metadata]) => {
    console.log('Résultat de la requête :', results);

    // Fermer la connexion après avoir exécuté la requête
    return sequelize.close();
  })
  .then(() => {
    console.log('Connexion à PostgreSQL fermée.');
  })
  .catch(err => {
    console.error('Erreur lors de la connexion ou de la requête :', err);
  });
