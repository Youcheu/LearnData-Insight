# 🔧 Guide de Débogage - LearnData Insight

## Problèmes Résolus

### 1. **Le formulaire ne soumet pas les données**
**Cause** : Collision de noms de variable dans le code JavaScript
```javascript
// ❌ MAUVAIS
const supabase = supabase.createClient(...);

// ✅ BON
const supabaseClient = window.supabase.createClient(...);
```

**Correction** : Changer `supabase` en `supabaseClient` dans tous les fichiers HTML

### 2. **Le message de confirmation ne s'affiche pas**
**Cause** : Le client Supabase n'était pas correctement initialisé
**Correction** : Le message devrait maintenant s'afficher pendant 5 secondes après la soumission

### 3. **Le dashboard ne se met pas à jour**
**Cause** : Les variables globales Supabase n'étaient pas correctement définies
**Solution** : Le fichier `public/supabase-config.js` doit être généré avant le démarrage

## 🚀 Lancer le serveur en local

### Option 1 : Utiliser le script (Linux/Mac)
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2 : Lancer manuellement
```bash
# Générer la config Supabase
npm run build

# Démarrer le serveur
cd public
python3 -m http.server 8080

# Accéder à: http://localhost:8080
```

### Option 3 : Avec Node.js (http-server)
```bash
npm install -g http-server
npm run build
http-server public -p 8080 -c-1
```

## 🧪 Tests à effectuer

### Test 1 : Formulaire
1. Accéder à `http://localhost:8080/collecte_de_donn_es.html`
2. Remplir le formulaire complètement
3. Cliquer sur "Soumettre les données"
4. ✅ Un message de confirmation devrait apparaître

### Test 2 : Dashboard
1. Accéder à `http://localhost:8080/tableau_de_bord.html`
2. Les statistiques doivent s'afficher (moyenne, écart-type, etc.)
3. Les graphiques doivent se mettre à jour toutes les 10 secondes
4. ✅ Les données du formulaire doivent être visibles

### Test 3 : Vérifier la console
Ouvrir les devtools (F12) et vérifier qu'il n'y a pas d'erreur :
- Pas d'erreur "supabaseClient is not defined"
- Pas d'erreur CORS
- `window.SUPABASE_URL` et `window.SUPABASE_ANON_KEY` doivent être définis

## 🐛 Erreurs communes

### Erreur : "window.supabase is not defined"
**Solution** : Vérifier que le script Supabase se charge depuis CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js"></script>
```

### Erreur : "SUPABASE_URL is not defined"
**Solution** : Générer le fichier de config
```bash
npm run build
```

### Les données ne s'affichent pas au dashboard
**Vérifier** :
1. La table `survey_data` existe dans Supabase
2. Les permissions RLS permettent la lecture (SELECT)
3. Ouvrir la console pour voir les erreurs Supabase

## 📊 Vérifier les données dans Supabase

1. Aller sur https://supabase.com
2. Se connecter avec le compte du projet
3. Aller dans l'onglet "SQL Editor"
4. Exécuter :
```sql
SELECT * FROM survey_data ORDER BY created_at DESC LIMIT 10;
```

## 🌐 Déploiement sur Vercel

Avant de déployer :
1. ✅ Tester localement avec `./start-dev.sh`
2. ✅ Vérifier que les données s'enregistrent
3. ✅ Vérifier que le dashboard affiche les données
4. ✅ Faire un commit et push sur GitHub
5. Vercel sera redéployé automatiquement

**Les variables d'environnement Vercel** :
- `DATABASE_URL` = URL de la base de données
- `NEXT_PUBLIC_SUPABASE_URL` = URL de Supabase
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Clé publishable

## 📞 Contact & Support

Si des problèmes persistent :
1. Vérifier les logs Supabase (https://app.supabase.com)
2. Vérifier la console du navigateur (F12)
3. S'assurer que la connexion Internet fonctionne
