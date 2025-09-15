// Importa le dipendenze
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Il server è attivo!' });
});

module.exports = router;
