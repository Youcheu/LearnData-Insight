#!/bin/bash

# Script pour démarrer le serveur de développement local

echo "🚀 Démarrage du serveur LearnData Insight..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé"
    echo "Veuillez exécuter ce script depuis le répertoire racine du projet"
    exit 1
fi

# Générer le fichier de config Supabase
echo "📝 Génération du fichier de configuration Supabase..."
npm run build

# Vérifier si le fichier a été créé
if [ ! -f "public/supabase-config.js" ]; then
    echo "❌ Erreur: Impossible de générer supabase-config.js"
    exit 1
fi

echo "✅ Fichier de config généré"
echo ""
echo "🌐 Lancement du serveur HTTP sur le port 8080..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Ouvrez votre navigateur à : http://localhost:8080"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Lancer le serveur Python
cd public
python3 -m http.server 8080
