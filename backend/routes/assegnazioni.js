// ✅ FILE: backend/routes/assegnazioni.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET tutte le assegnazioni con info personale + progetto
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT a.id, a.id_personale, a.id_progetto, a.percentuale,
             p.nome, p.cognome, p.ruolo,
             pr.titolo AS progetto
      FROM assegnazioni a
      JOIN personale p ON a.id_personale = p.id
      JOIN progetti pr ON a.id_progetto = pr.id
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Errore nel recupero assegnazioni' });
    }
});

// GET assegnazioni per una persona con titolo progetto
router.get('/persona/:id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.percentuale, pr.titolo AS progetto
            FROM assegnazioni a
            JOIN progetti pr ON a.id_progetto = pr.id
            WHERE a.id_personale = $1
        `, [req.params.id]);

        res.json(result.rows);
    } catch (err) {
        console.error("Errore nel recupero assegnazioni per persona:", err);
        res.status(500).json({ error: 'Errore nel recupero assegnazioni per persona' });
    }
});

// GET assegnazioni di un singolo progetto
router.get('/:progettoId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id_personale, percentuale FROM assegnazioni WHERE id_progetto = $1',
            [req.params.progettoId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Errore nel recupero assegnazioni del progetto' });
    }
});

router.get('/dettagli/:progettoId', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.percentuale, p.nome, p.cognome, p.ruolo
            FROM assegnazioni a
            JOIN personale p ON a.id_personale = p.id
            WHERE a.id_progetto = $1
        `, [req.params.progettoId]);

        res.json(result.rows);
    } catch (err) {
        console.error("Errore nel recupero dettagli assegnazioni:", err);
        res.status(500).json({ error: 'Errore nel recupero dettagli assegnazioni' });
    }
});



// POST: crea o sovrascrive assegnazioni per un progetto
router.post('/', async (req, res) => {
    const { id_progetto, assegnazioni } = req.body;

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Rimuovi vecchie assegnazioni e ripristina percentuali
        const vecchie = await client.query(
            'SELECT id_personale, percentuale FROM assegnazioni WHERE id_progetto = $1',
            [id_progetto]
        );

        for (const old of vecchie.rows) {
            await client.query(
                'UPDATE personale SET percentuale_impiego = percentuale_impiego - $1 WHERE id = $2',
                [old.percentuale, old.id_personale]
            );
        }

        await client.query('DELETE FROM assegnazioni WHERE id_progetto = $1', [id_progetto]);

        // 2. Inserisci nuove assegnazioni e aggiorna personale
        for (const a of assegnazioni) {
            const { id_personale, percentuale } = a;

            await client.query(
                'INSERT INTO assegnazioni (id_personale, id_progetto, percentuale) VALUES ($1, $2, $3)',
                [id_personale, id_progetto, percentuale]
            );

            await client.query(
                'UPDATE personale SET percentuale_impiego = percentuale_impiego + $1 WHERE id = $2',
                [percentuale, id_personale]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Errore durante il salvataggio assegnazioni' });
    } finally {
        client.release();
    }
});

module.exports = router;
