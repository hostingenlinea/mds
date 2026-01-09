// server/routes/pastores.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Necesario para encriptar

const prisma = new PrismaClient();

// OBTENER TODOS
router.get('/', async (req, res) => {
  const pastores = await prisma.pastor.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(pastores);
});

// OBTENER UNO SOLO (Para el perfil de usuario)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const pastor = await prisma.pastor.findUnique({
    where: { id: parseInt(id) }
  });
  if(pastor) res.json(pastor);
  else res.status(404).json({error: "No encontrado"});
});

// CREAR PASTOR (Con password hasheado)
router.post('/', async (req, res) => {
  const { nombre, apellido, dni, iglesiaNombre, fotoUrl, email, telefono, nombrePastora, rol } = req.body;
  
  // Por defecto, la contraseña será el DNI
  const hashedPassword = await bcrypt.hash(dni, 10); 

  try {
    const nuevo = await prisma.pastor.create({
      data: {
        nombre, apellido, dni, iglesiaNombre, fotoUrl,
        email, telefono, nombrePastora,
        password: hashedPassword, // Guardamos la contraseña segura
        rol: rol || "USER" // Si no especifican, es usuario normal
      }
    });
    res.json(nuevo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creando pastor (posible DNI duplicado)' });
  }
});

// ACTUALIZAR (Para editar datos)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    
    // Si intentan cambiar el password, hay que encriptarlo de nuevo
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    try {
        const actualizado = await prisma.pastor.update({
            where: { id: parseInt(id) },
            data: data
        });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ error: "Error actualizando" });
    }
});

module.exports = router;