import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// MYSQL CONNECTION
const pool = mysql.createPool({
  host: 'mysql-16fbe6d8-ruthyseatery12.l.aivencloud.com',
  port: 28811,
  user: 'avnadmin',
  password: 'YOUR_PASSWORD_HERE',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
});

const db = pool.promise();

// CREATE TABLE IF NOT EXISTS
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
        id INT PRIMARY KEY,
        config_json LONGTEXT
      )
    `);

    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
};

initDb();

// GET DATA
app.get('/api/data', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT config_json FROM site_configs WHERE id = 1'
    );

    if (rows.length > 0) {
      res.json(JSON.parse(rows[0].config_json));
    } else {
      res.status(404).json({
        message: 'No data found'
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// SAVE DATA
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
    res.status(500).json({
      error: err.message
    });
  }
});

// ROOT ROUTE
app.get('/', (req, res) => {
  res.send('Ruthy Backend Server is Running');
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Ruthy Backend Server is Live on Port ${PORT}`);
});
