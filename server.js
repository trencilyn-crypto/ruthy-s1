/**
 * PRODUCTION NODE.JS SERVER FOR RENDER + AIVEN
 */

import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Aiven MySQL Connection
const pool = mysql.createPool(process.env.AIVEN_URL);
const db = pool.promise();

// Initialize Database Table
const initDb = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_configs (
      id INT PRIMARY KEY,
      config_json LONGTEXT
    )
  `);
};

initDb();

// GET Site Data
app.get('/api/data', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT config_json FROM site_configs WHERE id = 1'
    );

    if (rows.length > 0) {
      res.json(JSON.parse(rows[0].config_json));
    } else {
      res.status(404).json({ message: 'No data found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Site Data
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

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Ruthy Backend Server is Live on Port ${PORT}`);
});
