const express = require('express');
const cors = require('cors');

const personaleRoutes = require('./routes/personale');
const progettiRoutes = require('./routes/progetti');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/personale', personaleRoutes);
app.use('/api/progetti', progettiRoutes);

app.get('/', (req, res) => {
    res.send('API attiva 🎉');
  });

  app.get('/ping-db', async (req, res) => {
    try {
      const result = await db.query('SELECT NOW()');
      res.send(`✅ Connessione riuscita: ${result.rows[0].now}`);
    } catch (err) {
      res.status(500).send('❌ Errore nella connessione: ' + err.message);
    }
  });

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
