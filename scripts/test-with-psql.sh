#!/bin/bash

# Script pour tester la connexion avec psql directement

echo "🔍 Test de connexion avec psql"
echo ""

# Extraire les informations de l'URL
DB_URL="${DATABASE_URL:-postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?sslmode=require}"

# Parser l'URL
HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo "Configuration:"
echo "  Host: $HOST"
echo "  Port: $PORT"
echo "  Database: $DB"
echo "  User: $USER"
echo "  Password: ${PASSWORD:0:10}..."
echo ""

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé"
    echo ""
    echo "Pour installer psql sur Ubuntu/Debian:"
    echo "  sudo apt-get install postgresql-client"
    echo ""
    echo "Ou testez avec une autre méthode de connexion"
    exit 1
fi

echo "🧪 Test 1: Connexion avec PGPASSWORD"
echo "----------------------------------------"
export PGPASSWORD="$PASSWORD"
if psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT version();" 2>&1; then
    echo ""
    echo "✅ Connexion réussie avec PGPASSWORD!"
    exit 0
else
    echo "❌ Échec avec PGPASSWORD"
fi

echo ""
echo "🧪 Test 2: Connexion avec URL complète"
echo "----------------------------------------"
if psql "$DB_URL" -c "SELECT version();" 2>&1; then
    echo ""
    echo "✅ Connexion réussie avec URL complète!"
    exit 0
else
    echo "❌ Échec avec URL complète"
fi

echo ""
echo "🧪 Test 3: Connexion avec prompt interactif"
echo "----------------------------------------"
echo "Tentative de connexion (vous devrez entrer le mot de passe manuellement):"
psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT version();"

echo ""
echo "📋 Si toutes les tentatives échouent:"
echo "1. Vérifiez que les identifiants sont corrects"
echo "2. Vérifiez que votre IP est autorisée dans pg_hba.conf"
echo "3. Vérifiez les logs PostgreSQL sur le serveur"

