// server/index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Importar rutas
const pastoresRoutes = require('./routes/pastores');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');

// 1. CREAR LA APP (Esto debe ir antes de cualquier app.use)
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// 2. MIDDLEWARES (Configuraciones)
app.use(express.json()); // <--- ¡Vital para que funcione el Login!
app.use(cors());

// 3. RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pastores', pastoresRoutes);

// 4. INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});