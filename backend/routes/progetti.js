const express = require('express');
const router = express.Router();
const db = require('../db');

// GET tutti
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM progetti ORDER BY id desc');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET per ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM progetti WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST
router.post('/', async (req, res) => {
  const { titolo, data_inizio, durata_presunta, data_rilascio } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO progetti (titolo, data_inizio, durata_presunta, data_rilascio)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [titolo, data_inizio, durata_presunta, data_rilascio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT
router.put('/:id', async (req, res) => {
  const { titolo, data_inizio, durata_presunta, data_rilascio } = req.body;
  try {
    const result = await db.query(
      `UPDATE progetti SET titolo=$1, data_inizio=$2, durata_presunta=$3, data_rilascio=$4
       WHERE id=$5 RETURNING *`,
      [titolo, data_inizio, durata_presunta, data_rilascio, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM progetti WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
