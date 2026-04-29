require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const databaseUrl = process.env.DATABASE_URL;
let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl && databaseUrl) {
  try {
    const dbUrl = new URL(databaseUrl);
    supabaseUrl = `https://${dbUrl.hostname}${dbUrl.port ? `:${dbUrl.port}` : ''}`;
  } catch (error) {
    console.error('Impossible de parser DATABASE_URL :', error.message);
    process.exit(1);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur : SUPABASE_URL (ou DATABASE_URL) et SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY doivent être définis.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TOTAL = 171;
const distribution = [
  ...Array(86).fill('homme'),
  ...Array(68).fill('femme'),
  ...Array(8).fill('autre'),
  ...Array(9).fill('ne souhaite pas répondre')
];

const filieres = ['Médecine', 'Droit', 'Économie', 'Lettres', 'Sciences', 'Arts', 'Gestion', 'Design'];
const outils = ['Ordinateur', 'Tablette', 'Téléphone', 'Cahiers', 'Livres', 'Logiciels', 'Applications'];
const sports = ['oui', 'non'];
const conseils = ['Étudie régulièrement', 'Fais des pauses', 'Travaille en groupe', 'Pose des questions', 'Pratique avec des exercices'];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function chooseFiliere() {
  if (Math.random() < 0.7) return 'Informatique';
  return filieres[Math.floor(Math.random() * filieres.length)];
}

function buildEntry(genre) {
  return {
    genre,
    filiere: chooseFiliere(),
    heures: Math.floor(Math.random() * 51),
    outils_numeriques: outils[Math.floor(Math.random() * outils.length)],
    note: Math.floor(Math.random() * 21),
    sport: sports[Math.floor(Math.random() * sports.length)],
    conseil: conseils[Math.floor(Math.random() * conseils.length)]
  };
}

async function seed() {
  shuffle(distribution);
  const entries = distribution.map(buildEntry);

  console.log(`Insertion de ${entries.length} entrées fictives dans Supabase...`);
  const response = await supabase.from('survey_data').insert(entries).select();
  const { data, error } = response;

  if (error) {
    console.error('Erreur Supabase:', error.message || error);
    process.exit(1);
  }

  if (!data) {
    console.error('Aucune donnée renvoyée par Supabase. Response =', JSON.stringify(response, null, 2));
    process.exit(1);
  }

  console.log('Inséré avec succès', data.length, 'entrées.');
}

seed().catch((error) => {
  console.error('Erreur inattendue :', error);
  process.exit(1);
});