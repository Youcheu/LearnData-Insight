# LearnData Insight

Application front-end statique utilisant Supabase pour stocker les données des formulaires et afficher le tableau de bord.

## Architecture

- Pas de backend Express
- Pages servies en statique depuis `public/`
- Supabase gère le stockage des données
- `public/collecte_de_donn_es.html` envoie les données vers Supabase
- `public/tableau_de_bord.html` lit les données depuis Supabase

## Déploiement Vercel

1. Définis ces variables d'environnement dans Vercel :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Assure-toi que `vercel.json` existe dans le projet.
3. Déploie le projet normalement.

## Variables d'environnement locales

Crée un fichier `.env` à la racine du projet contenant :

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-public-anon-key>
```

Si tu as déjà un `DATABASE_URL` Supabase, le script de build peut en extraire l'URL du projet :

```env
DATABASE_URL=postgresql://username:password@<host>:5432/postgres
```

Sur Vercel, ajoute les mêmes variables dans les paramètres d'environnement du projet.

## Setup Supabase

Tu dois créer une table `survey_data` dans Supabase avec le schéma suivant :

```sql
CREATE TABLE public.survey_data (
  id SERIAL PRIMARY KEY,
  genre TEXT,
  filiere TEXT,
  heures INTEGER,
  outils_numeriques TEXT,
  note NUMERIC,
  sport TEXT,
  conseil TEXT,
  isReal INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Laisse `Row Level Security` désactivé pour un accès direct en lecture/écriture depuis le front-end, ou configure des policies adaptées.

## Commandes

- `npm install` pour installer `dotenv` (utilisé localement pour générer la config)
- `npm run build` pour générer `public/supabase-config.js`
- `npm run vercel-build` est identique à `npm run build`

## Notes

- `public/supabase-config.js` est généré à chaque build et n'est pas commité.
- Le backend Express a été supprimé. Le site est désormais entièrement statique.
