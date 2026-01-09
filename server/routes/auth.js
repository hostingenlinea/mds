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

// --- RUTA DE RESCATE (SOLO PARA EMERGENCIAS) ---
router.get('/crear-admin-rescate', async (req, res) => {
  const dniAdmin = "11111111";
  const passAdmin = "admin123";
  
  try {
    // Encriptar la contraseña de nuevo para asegurar que sea correcta
    const hashedPassword = await bcrypt.hash(passAdmin, 10);

    // Crear o Actualizar el usuario
    const admin = await prisma.pastor.upsert({
      where: { dni: dniAdmin },
      update: { 
        password: hashedPassword, // Resetea la contraseña
        rol: "ADMIN"              // Asegura el rol
      }, 
      create: {
        nombre: "Administrador",
        apellido: "Principal",
        dni: dniAdmin,
        password: hashedPassword,
        rol: "ADMIN",
        estado: "HABILITADO",
        iglesiaNombre: "Casa Central"
      },
    });

    res.send(`
      <h1 style="color:green">✅ Admin Restaurado con Éxito</h1>
      <p>Ya puedes iniciar sesión con:</p>
      <ul>
        <li><b>Usuario (DNI):</b> ${dniAdmin}</li>
        <li><b>Contraseña:</b> ${passAdmin}</li>
      </ul>
      <a href="/login">Ir al Login</a>
    `);

  } catch (error) {
    res.status(500).send("❌ Error creando admin: " + error.message);
  }
});

module.exports = router;