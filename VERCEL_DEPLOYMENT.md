# LearnData Insight - Déploiement Vercel

## 📋 Instructions de déploiement

### Prérequis
- Un compte GitHub (déjà fait ✓)
- Un compte Vercel (création gratuite sur https://vercel.com)

### Étapes de déploiement

1. **Connectez-vous à Vercel**
   - Allez sur https://vercel.com
   - Cliquez sur "Sign Up" ou "Log In"
   - Authentifiez-vous avec votre compte GitHub

2. **Déployez le projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre dépôt `LearnData-Insight`
   - Vercel détectera automatiquement Node.js/Express
   - Cliquez sur "Deploy"

3. **Attendez le déploiement**
   - Vercel construit et déploie votre application
   - Vous recevrez une URL en direct (ex: https://learndata-insight.vercel.app)

### Configuration du déploiement

Le projet est configuré avec :
- **vercel.json** : Configuration Vercel (routes, builds)
- **api/index.js** : Fonction serverless Express.js
- **.vercelignore** : Fichiers à ignorer lors du déploiement

### 📝 Notes importantes

⚠️ **Base de données SQLite**
- SQLite est utilisée localement et fonctionnera sur Vercel
- ⚠️ Les données ne persisteront PAS entre les redéploiements (stockage éphémère)
- **Recommandation** : Pour la production, migrez vers :
  - MongoDB Atlas (gratuit)
  - PostgreSQL sur Railway/Neon
  - Firebase Realtime Database

### Structure du déploiement

```
/api/index.js          → Fonction serverless (Express)
/public/               → Fichiers statiques (HTML, CSS, images)
vercel.json           → Configuration Vercel
.vercelignore         → Fichiers ignorés
```

### Développement local

```bash
npm install
npm run dev
# Visite: http://localhost:3000
```

### Commandes utiles

```bash
# Voir les logs Vercel
vercel logs

# Redéployer
vercel deploy --prod

# Variables d'environnement (si besoin)
vercel env add
```

---

🚀 **Votre application est prête pour Vercel !**
