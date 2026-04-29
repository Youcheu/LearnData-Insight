require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

// Redirect root to the collection page
app.get('/', (req, res) => {
    res.redirect('/collecte_de_donn_es.html');
});

app.use(express.static(path.join(__dirname, 'public')));

// Configuration options for random data
const genres = ['Homme', 'Femme', 'Autre', 'Ne souhaite pas répondre'];
const filieres = ['Informatique', 'Mathématiques', 'Physique', 'Biologie', 'Lettres', 'Droit', 'Autre'];
const outilsOptions = ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'];
const sportOptions = ['0', '1-2', '3-4', '5 et plus'];
const conseils = [
    "Travailler régulièrement et par petits blocs.",
    "Faire des fiches de synthèse après chaque cours.",
    "Revoir les exercices difficiles plusieurs fois.",
    "Participer activement en cours et poser des questions.",
    "Organiser son temps avec un planning hebdomadaire.",
    "Dormir suffisamment pour favoriser la mémorisation.",
    "S'entraider entre étudiants du même parcours."
];

/**
 * Generates a realistic record with correlation between hours and grade.
 */
function generateRecord(isReal = false) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const filiere = filieres[Math.floor(Math.random() * filieres.length)];
    const heures = Math.floor(Math.random() * 40) + 2;
    const outils_numeriques = outilsOptions[Math.floor(Math.random() * outilsOptions.length)];
    
    const noise = (Math.random() - 0.5) * 4;
    let note = 8 + (heures / 4) + noise;
    note = Math.max(0, Math.min(20, Math.round(note * 10) / 10));

    const sport = sportOptions[Math.floor(Math.random() * sportOptions.length)];
    const conseil = conseils[Math.floor(Math.random() * conseils.length)];

    return {
        genre,
        filiere,
        heures,
        outils_numeriques,
        note,
        sport,
        conseil,
        isReal: isReal ? 1 : 0
    };
}

/**
 * Initialize Database and Start Server
 */
async function start() {
    // Open DB
    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Create Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS survey_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            genre TEXT,
            filiere TEXT,
            heures INTEGER,
            outils_numeriques TEXT,
            note REAL,
            sport TEXT,
            conseil TEXT,
            isReal INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Initial check: if empty, add some initial data
    const count = await db.get('SELECT COUNT(*) as count FROM survey_data');
    if (count.count === 0) {
        for (let i = 0; i < 15; i++) {
            const data = generateRecord(false);
            await db.run(
                `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.genre, data.filiere, data.heures, data.outils_numeriques, data.note, data.sport, data.conseil, data.isReal]
            );
        }
        console.log('[DB] Données initiales générées.');
    }

    // Background bot: Add a record every 45 seconds
    setInterval(async () => {
        const data = generateRecord(false);
        await db.run(
            `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.genre, data.filiere, data.heures, data.outils_numeriques, data.note, data.sport, data.conseil, data.isReal]
        );
        const total = await db.get('SELECT COUNT(*) as count FROM survey_data');
        console.log(`[BOT] Nouvel enregistrement ajouté par le bot. Total: ${total.count}`);
    }, 45000);

    // API Endpoints
    app.post('/api/submit', async (req, res) => {
        try {
            const { genre, filiere, heures, outils_numeriques, note, sport, conseil } = req.body;
            
            await db.run(
                `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [genre, filiere, parseInt(heures), outils_numeriques, parseFloat(note), sport, conseil, 1]
            );

            const total = await db.get('SELECT COUNT(*) as count FROM survey_data');
            console.log(`[DATA] Inscription manuelle reçue. Total: ${total.count}`);
            
            res.json({ success: true, total: total.count });
        } catch (error) {
            console.error('[ERROR] Submit failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.get('/api/data', async (req, res) => {
        try {
            const data = await db.all('SELECT genre, filiere, heures, outils_numeriques, note, sport, conseil FROM survey_data ORDER BY created_at DESC');
            res.json(data);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Start listening
    app.listen(PORT, () => {
        console.log(`Server LearnData Insight running on http://localhost:${PORT}`);
        console.log(`Database attached: database.sqlite`);
    });
}

start().catch(err => {
    console.error('Critical failure starting server:', err);
});
