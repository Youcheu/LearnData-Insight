require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');

async function migrate() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('Erreur : DATABASE_URL non défini dans .env');
        process.exit(1);
    }

    const sqliteFile = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
    if (!fs.existsSync(sqliteFile)) {
        console.error(`Erreur : fichier SQLite introuvable : ${sqliteFile}`);
        process.exit(1);
    }

    const sqliteDb = await open({
        filename: sqliteFile,
        driver: sqlite3.Database
    });

    const rows = await sqliteDb.all('SELECT * FROM survey_data');
    console.log(`Lecture de ${rows.length} enregistrements depuis ${sqliteFile}`);

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await pool.query(`
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

        await pool.query('BEGIN');

        for (const row of rows) {
            await pool.query(
                `INSERT INTO survey_data (genre, filiere, heures, outils_numeriques, note, sport, conseil, isReal, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [row.genre, row.filiere, row.heures, row.outils_numeriques, row.note, row.sport, row.conseil, row.isReal, row.created_at]
            );
        }

        await pool.query('COMMIT');
        console.log(`Migration terminée : ${rows.length} enregistrements transférés vers Supabase.`);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur pendant la migration :', error);
        process.exit(1);
    } finally {
        await sqliteDb.close();
        await pool.end();
    }
}

migrate().catch(error => {
    console.error('Migration échouée :', error);
    process.exit(1);
});
