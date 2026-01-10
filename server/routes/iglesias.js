// server/routes/iglesias.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// OBTENER TODAS
router.get('/', async (req, res) => {
  try {
    const iglesias = await prisma.iglesia.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(iglesias);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo iglesias" });
  }
});

// CREAR
router.post('/', async (req, res) => {
  try {
    const nueva = await prisma.iglesia.create({ data: req.body });
    res.json(nueva);
  } catch (error) {
    res.status(400).json({ error: "Error creando sede" });
  }
});

// EDITAR
router.put('/:id', async (req, res) => {
  try {
    const editada = await prisma.iglesia.update({ 
      where: { id: parseInt(req.params.id) }, 
      data: req.body 
    });
    res.json(editada);
  } catch (error) {
    res.status(400).json({ error: "Error editando" });
  }
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  try {
    await prisma.iglesia.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando" });
  }
});

// --- ¡ESTA LÍNEA ES LA QUE FALTABA O FALLABA! ---
module.exports = router;