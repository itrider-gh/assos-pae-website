A faire pour tester le déploiement type MEP :

- Config le back (ip du front, back, auth simde, id + secret) back/config/index.js

- Passer sur une DB mysql (voir version actuellement en prod et s'y conformer)

- Créer la base "pae" et entrer les infos d'accés dans back/config/index.js

- "npx sequelize-cli db:migrate" pour créer les tables

- Si problème --> debug les problèmes de compatibilité probable entre sequelize et mysql2

- Une fois que c'est bon, lancer le back, le front et tester les fonctionnalités

- Si tout fonctionne, créer un dockerfile et docker compose (demander un accés à la base pae de prod au préalable)
