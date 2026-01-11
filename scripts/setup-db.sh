#!/bin/bash

# Script de configuration de la base de données DUERP AI

set -e

echo "🚀 Configuration de la base de données DUERP AI"
echo ""

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Le fichier .env n'existe pas"
    exit 1
fi

# Charger les variables d'environnement
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Étapes de configuration :"
echo "1. Test de connexion"
echo "2. Création des migrations"
echo "3. Application des migrations"
echo ""

# Test de connexion
echo "🔍 Test de connexion à la base de données..."
if node scripts/test-db-connection.js; then
    echo "✅ Connexion réussie"
else
    echo "❌ Échec de la connexion"
    echo ""
    echo "Vérifiez :"
    echo "- Que les identifiants dans .env sont corrects"
    echo "- Que votre IP est autorisée sur le serveur PostgreSQL"
    echo "- Que le serveur PostgreSQL accepte les connexions externes"
    exit 1
fi

echo ""
echo "📦 Création des migrations..."
pnpm db:migrate --name init

echo ""
echo "✅ Configuration terminée avec succès !"
echo ""
echo "Prochaines étapes :"
echo "- Générer le client Prisma : pnpm db:generate"
echo "- Ouvrir Prisma Studio : pnpm db:studio"
echo "- Lancer l'application : pnpm dev"

