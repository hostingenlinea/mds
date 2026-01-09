// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET_KEY = "mi_secreto_super_seguro"; // En producción esto va en .env

// LOGIN
router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    // 1. Buscar usuario por DNI
    const pastor = await prisma.pastor.findUnique({ where: { dni } });
    if (!pastor) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 2. Verificar contraseña
    const validPassword = await bcrypt.compare(password, pastor.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // 3. Generar Token
    const token = jwt.sign({ id: pastor.id, rol: pastor.rol }, SECRET_KEY, { expiresIn: '8h' });

    // 4. Responder con datos y token
    res.json({ 
      token, 
      user: { 
        id: pastor.id, 
        nombre: pastor.nombre, 
        rol: pastor.rol 
      } 
    });

  } catch (error) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

module.exports = router;