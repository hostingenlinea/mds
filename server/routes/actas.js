const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// OBTENER TODAS
router.get('/', async (req, res) => {
  try {
    const actas = await prisma.acta.findMany({ orderBy: { fecha: 'desc' } });
    res.json(actas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener actas" });
  }
});

// CREAR NUEVA
router.post('/', async (req, res) => {
  // Ahora recibimos también 'iglesiaNombre'
  const { titulo, contenido, iglesiaNombre, archivoUrl } = req.body;
  
  try {
    const nueva = await prisma.acta.create({
      data: { 
        titulo, 
        contenido, 
        iglesiaNombre, // Guardamos la iglesia obligatoria
        archivoUrl 
      }
    });
    res.json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar acta. Verifique los datos." });
  }
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.acta.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;