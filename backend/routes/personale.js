const express = require('express');
const router = express.Router();
const db = require('../db');

// GET tutti
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM personale ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET per ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM personale WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST
router.post('/', async (req, res) => {
  const { matricola, df, nome, cognome, ruolo, percentuale_impiego } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO personale (matricola, df, nome, cognome, ruolo, percentuale_impiego)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [matricola, df, nome, cognome, ruolo, percentuale_impiego]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { matricola, df, nome, cognome, ruolo, percentuale_impiego } = req.body;
  try {
    const result = await db.query(
      `UPDATE personale SET matricola=$1, df=$2, nome=$3, cognome=$4, ruolo=$5, percentuale_impiego=$6
       WHERE id=$7 RETURNING *`,
      [matricola, df, nome, cognome, ruolo, percentuale_impiego, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM personale WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
