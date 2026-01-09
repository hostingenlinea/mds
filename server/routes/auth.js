// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET_KEY = "mi_secreto_super_seguro"; // En producción usar variables de entorno

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    // 1. Buscar usuario por DNI
    const pastor = await prisma.pastor.findUnique({ where: { dni } });
    if (!pastor) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 2. Verificar contraseña
    const validPassword = await bcrypt.compare(password, pastor.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // --- NUEVO: Actualizar Estadísticas de Login ---
    try {
      await prisma.pastor.update({
        where: { id: pastor.id },
        data: { 
          vecesLogin: { increment: 1 }, // Suma 1 al contador
          ultimoLogin: new Date()       // Guarda la fecha y hora actual
        }
      });
    } catch (statsError) {
      console.error("Error actualizando estadísticas (no crítico):", statsError);
      // No detenemos el login si falla la estadística, solo lo registramos en consola
    }
    // ------------------------------------------------

    // 3. Generar Token de sesión
    const token = jwt.sign({ id: pastor.id, rol: pastor.rol }, SECRET_KEY, { expiresIn: '8h' });

    // 4. Responder al cliente
    res.json({ 
      token, 
      user: { 
        id: pastor.id, 
        nombre: pastor.nombre, 
        rol: pastor.rol 
      } 
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
});

// --- RUTA DE RESCATE (SOLO EMERGENCIA) ---
// Úsala si alguna vez borras la base de datos y te quedas sin Admin
router.get('/crear-admin-rescate', async (req, res) => {
  const dniAdmin = "11111111";
  const passAdmin = "admin123";
  
  try {
    const hashedPassword = await bcrypt.hash(passAdmin, 10);

    await prisma.pastor.upsert({
      where: { dni: dniAdmin },
      update: { password: hashedPassword, rol: "ADMIN" }, 
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

    res.send(`<h1>✅ Admin Restaurado</h1><p>Usuario: ${dniAdmin} / Clave: ${passAdmin}</p>`);
  } catch (error) {
    res.status(500).send("❌ Error: " + error.message);
  }
});

module.exports = router;