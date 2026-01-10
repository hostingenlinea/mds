// server/index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// 1. IMPORTAR RUTAS
const pastoresRoutes = require('./routes/pastores');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const iglesiasRoutes = require('./routes/iglesias');
const actasRoutes = require('./routes/actas');

// 2. CREAR APP
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// 3. MIDDLEWARES
app.use(express.json());
app.use(cors());

// 4. USAR RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pastores', pastoresRoutes);
app.use('/api/iglesias', iglesiasRoutes); // <--- Conectar la ruta
app.use('/api/actas', actasRoutes);

// 5. INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});