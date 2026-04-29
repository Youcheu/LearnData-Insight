# LearnData Insight

Application Express + SQLite pour la collecte de données et l'affichage de tableaux de bord.

## Déploiement Vercel

Clique sur le bouton ci-dessous pour déployer directement le projet sur Vercel :

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Youcheu/LearnData-Insight&project-name=learndata-insight&repo-name=learndata-insight)

> Utilise un nom de projet Vercel valide : uniquement lettres, chiffres, `-`, `_`, `.` et pas d’espace.

## Configuration

- `vercel.json` est déjà configuré pour rediriger toutes les requêtes vers `api/index.js`.
- `package.json` contient les scripts suivants :
  - `npm run dev` pour démarrer localement
  - `npm run build` pour la build Vercel
  - `npm run vercel-build` pour l'étape de build Vercel

## Variables d'environnement

Utilise le fichier `.env` local ou configure les variables directement dans le dashboard Vercel :

- `PORT` (optionnel)
- `DATABASE_PATH` (optionnel, local seulement)
- `DATABASE_URL` (utiliser une base Postgres externe en production)
- `NODE_ENV`

> En production Vercel, l'application utilisera `/tmp/database.sqlite` si `DATABASE_URL` n'est pas défini.
> Si `DATABASE_URL` est défini, l'application se connectera à une base Postgres externe et gardera les données persistantes.

## Notes

- Le projet utilise `dotenv` pour charger les variables locales.
- La base SQLite est stockée en local et n'est pas persistante sur Vercel entre les déploiements.
