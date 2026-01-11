// Vérifier si le mot de passe nécessite un encodage URL

const password = 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF';

console.log('🔍 Analyse du mot de passe');
console.log('='.repeat(60));
console.log(`Mot de passe original: ${password}`);
console.log(`Longueur: ${password.length} caractères`);
console.log('');

// Vérifier les caractères spéciaux
const specialChars = password.match(/[^a-zA-Z0-9]/g);
if (specialChars) {
  console.log('⚠️  Caractères spéciaux détectés:', [...new Set(specialChars)].join(', '));
  console.log('   Ces caractères peuvent nécessiter un encodage URL');
} else {
  console.log('✅ Pas de caractères spéciaux nécessitant un encodage');
}

console.log('');
console.log('🔗 URLs de test avec différents encodages:');
console.log('');

// URL originale
const baseUrl = 'postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres';

console.log('1. URL originale:');
console.log(`   ${baseUrl}?sslmode=require`);
console.log('');

// URL avec encodage du mot de passe
const encodedPassword = encodeURIComponent(password);
console.log('2. URL avec mot de passe encodé:');
console.log(`   postgres://postgres:${encodedPassword}@46.224.147.210:5432/postgres?sslmode=require`);
console.log('');

// Test si l'encodage change quelque chose
if (password !== encodedPassword) {
  console.log('⚠️  Le mot de passe nécessite un encodage URL');
  console.log('   Essayez la version encodée dans votre .env');
} else {
  console.log('✅ Le mot de passe ne nécessite pas d\'encodage');
}

console.log('');
console.log('💡 Note: Certains caractères dans les mots de passe PostgreSQL');
console.log('   peuvent causer des problèmes si non encodés correctement.');

