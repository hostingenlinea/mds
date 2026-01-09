// server/routes/pastores.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Obtener todos los pastores (Para el Admin)
router.get('/', async (req, res) => {
  try {
    const pastores = await prisma.pastor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(pastores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pastores' });
  }
});

// 2. Obtener un pastor por ID (Para la Credencial)
router.get('/:id', async (req, res) => {
  try {
    const pastor = await prisma.pastor.findUnique({
      where: { id: req.params.id }
    });
    if (!pastor) return res.status(404).json({ error: 'Pastor no encontrado' });
    res.json(pastor);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar pastor' });
  }
});

// 3. Crear un nuevo Pastor
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, dni, iglesiaNombre, ficheroCulto, fotoUrl } = req.body;
    const nuevoPastor = await prisma.pastor.create({
      data: {
        nombre,
        apellido,
        dni,
        iglesiaNombre,
        ficheroCulto,
        fotoUrl, // Por ahora recibimos la URL como texto (luego integramos MinIO)
        estado: 'HABILITADO'
      }
    });
    res.json(nuevoPastor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creando pastor (¿DNI duplicado?)' });
  }
});

// 4. Cambiar estado (Habilitar/Suspender)
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body; // Espera { "estado": "SUSPENDIDO" }
  try {
    const pastor = await prisma.pastor.update({
      where: { id: req.params.id },
      data: { estado }
    });
    res.json(pastor);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

module.exports = router;