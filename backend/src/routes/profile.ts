const express = require('express');
const router = express.Router();

router.post('/', (req:any, res:any) => {
  // logica creazione
  res.status(201).json({ id: 999, ...req.body });
});

module.exports = router;