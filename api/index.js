require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect root to the collection page
app.get('/', (req, res) => {
    res.redirect('/collecte_de_donn_es.html');
});

// Serve HTML files
app.get('/collecte_de_donn_es.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/collecte_de_donn_es.html'));
});

app.get('/tableau_de_bord.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/tableau_de_bord.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

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
 * Initialize Database
 */
let db;
let pgPool;
const isPostgres = Boolean(process.env.DATABASE_URL);

async function initializeDb() {
    if (db || pgPool) return; // Already initialized

    try {
        if (isPostgres) {
            pgPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            await pgPool.query(`
                CREATE TABLE IF NOT EXISTS survey_data (
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
                )
            `);

            const result = await pgPool.query('SELECT COUNT(*) as count FROM survey_data');
            const count = parseInt(result.rows[0].count, 10);
            if (count === 0) {
                for (let i = 0; i < 15; i++) {
                    const data = generateRecord(false);
                    await runQuery(
                        `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [data.genre, data.filiere, data.heures, data.outils_numeriques, data.note, data.sport, data.conseil, data.isReal]
                    );
                }
                console.log('[DB] Données initiales générées (Postgres).');
            }
            return;
        }

        const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
        const dbPath = process.env.DATABASE_PATH || (isVercel ? '/tmp/database.sqlite' : path.join(__dirname, '../database.sqlite'));

        console.log(`[DB] Using database path: ${dbPath}`);

        db = await open({
            filename: dbPath,
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
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Initialize DB on first request (cold start)
app.use(async (req, res, next) => {
    try {
        await initializeDb();
        next();
    } catch (error) {
        console.error('[INIT ERROR]', error);
        res.status(500).json({ error: 'Database initialization failed', details: error.message });
    }
});

function buildSqlParams(isPostgres, sql, params) {
    if (isPostgres) {
        // convert ? placeholders to $1, $2, ... for PostgreSQL
        let index = 1;
        const converted = sql.replace(/\?/g, () => `$${index++}`);
        return { sql: converted, params };
    }
    return { sql, params };
}

async function runQuery(sql, params = []) {
    if (pgPool) {
        const { sql: pgSql, params: pgParams } = buildSqlParams(true, sql, params);
        return await pgPool.query(pgSql, pgParams);
    }
    return await db.run(sql, params);
}

async function getQuery(sql, params = []) {
    if (pgPool) {
        const { sql: pgSql, params: pgParams } = buildSqlParams(true, sql, params);
        const result = await pgPool.query(pgSql, pgParams);
        return result.rows[0];
    }
    return await db.get(sql, params);
}

async function allQuery(sql, params = []) {
    if (pgPool) {
        const { sql: pgSql, params: pgParams } = buildSqlParams(true, sql, params);
        const result = await pgPool.query(pgSql, pgParams);
        return result.rows;
    }
    return await db.all(sql, params);
}

// API Endpoints
app.post('/api/submit', async (req, res) => {
    try {
        const { genre, filiere, heures, outils_numeriques, note, sport, conseil } = req.body;
        
        await runQuery(
            `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [genre, filiere, parseInt(heures), outils_numeriques, parseFloat(note), sport, conseil, 1]
        );

        const total = await getQuery('SELECT COUNT(*) as count FROM survey_data');
        console.log(`[DATA] Inscription manuelle reçue. Total: ${total.count}`);
        
        res.json({ success: true, total: total.count });
    } catch (error) {
        console.error('[ERROR] Submit failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await allQuery('SELECT genre, filiere, heures, outils_numeriques, note, sport, conseil FROM survey_data ORDER BY created_at DESC');
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LearnData Insight API is running' });
});

module.exports = app;
