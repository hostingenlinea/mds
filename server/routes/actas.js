const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const actas = await prisma.acta.findMany({ orderBy: { fecha: 'desc' } });
  res.json(actas);
});

router.post('/', async (req, res) => {
  try {
    const nueva = await prisma.acta.create({ data: req.body });
    res.json(nueva);
  } catch (error) { res.status(400).json({ error: "Error al crear acta" }); }
});

module.exports = router;