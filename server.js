import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// FIX __dirname FOR ES MODULE
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MYSQL CONNECTION
const pool = mysql.createPool({
  host: 'mysql-16fbe6d8-ruthyseatery12.l.aivencloud.com',
  port: 28811,
  user: 'avnadmin',
  password: 'AVNS_b_GwzztL-Efn3ph3zyE',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
});

const db = pool.promise();

// INITIALIZE DATABASE
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
        id INT PRIMARY KEY,
        config_json LONGTEXT
      )
    `);

    console.log('✅ Database Connected');
  } catch (err) {
    console.error('❌ Database Error:', err);
  }
};

initDb();

// GET DATA API
app.get('/api/data', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT config_json FROM site_configs WHERE id = 1'
    );

    if (rows.length > 0) {
      res.json(JSON.parse(rows[0].config_json));
    } else {
      res.json({});
    }
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// SAVE DATA API
app.post('/api/data', async (req, res) => {
  try {
    const config = JSON.stringify(req.body);

    await db.query(
      `
      INSERT INTO site_configs (id, config_json)
      VALUES (1, ?)
      ON DUPLICATE KEY UPDATE config_json = ?
      `,
      [config, config]
    );

    res.json({
      success: true
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// SERVE FRONTEND
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Ruthy System Running on Port ${PORT}`);
});

// ERROR HANDLERS
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});
