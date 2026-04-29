require('dotenv').config();
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl && databaseUrl) {
  try {
    const dbUrl = new URL(databaseUrl);
    supabaseUrl = `https://${dbUrl.hostname}${dbUrl.port ? `:${dbUrl.port}` : ''}`;
  } catch (error) {
    // ignore parse errors
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur : SUPABASE_URL (ou DATABASE_URL) et SUPABASE_ANON_KEY doivent être définis.');
  process.exit(1);
}

const target = path.join(__dirname, '../public/supabase-config.js');
const content = `window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
`;
fs.writeFileSync(target, content, 'utf8');
console.log('Fichier supabase-config.js généré.');
