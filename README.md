# LearnData Insight

Application Express avec support PostgreSQL via Supabase et fallback SQLite local pour le développement.

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

## Migration SQLite → Supabase

1. Crée un fichier `.env` local avec :
   ```env
   DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@db.xrtzwikiyumsqdkwbmli.supabase.co:5432/postgres
   ```
2. Vérifie que `database.sqlite` existe à la racine du projet.
3. Lance la migration :
   ```bash
   npm run migrate:sqlite-to-supabase
   ```
4. Copie la même valeur `DATABASE_URL` dans les variables d'environnement de Vercel.
5. Redéploie le projet.

## Notes

- Le projet utilise `dotenv` pour charger les variables locales.
- En local, `SQLite` reste un fallback si `DATABASE_URL` n'est pas défini.
- Sur Vercel, `DATABASE_URL` est recommandé pour une base persistante.
