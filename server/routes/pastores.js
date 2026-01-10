const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// OBTENER TODOS
router.get('/', async (req, res) => {
  const pastores = await prisma.pastor.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(pastores);
});

// OBTENER UNO
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pastor = await prisma.pastor.findUnique({ where: { id: parseInt(id) } });
    if (pastor) {
       // Sumar vista en segundo plano
       await prisma.pastor.update({ where: { id: parseInt(id) }, data: { vecesVisto: { increment: 1 } } });
       res.json(pastor);
    } else {
       res.status(404).json({error: "No encontrado"});
    }
  } catch (e) { res.status(500).json({error: "Error"}); }
});

// CREAR (Con Contraseña Personalizada)
router.post('/', async (req, res) => {
  const { nombre, apellido, dni, iglesiaNombre, fotoUrl, email, telefono, nombrePastora, rol, password } = req.body;
  
  // Usar la contraseña enviada O el DNI si no escribieron nada
  const passToHash = (password && password.trim() !== "") ? password : dni;
  const hashedPassword = await bcrypt.hash(passToHash, 10); 

  try {
    const nuevo = await prisma.pastor.create({
      data: {
        nombre, apellido, dni, iglesiaNombre, fotoUrl,
        email, telefono, nombrePastora,
        password: hashedPassword,
        rol: rol || "USER"
      }
    });
    res.json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error creando pastor (DNI duplicado)' });
  }
});

// ACTUALIZAR (Inteligente: Solo cambia password si se envía uno nuevo)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Si viene password y no está vacío, lo encriptamos
    if (data.password && data.password.trim() !== "") {
        data.password = await bcrypt.hash(data.password, 10);
    } else {
        // Si está vacío o no viene, lo borramos del objeto para que Prisma NO lo toque
        delete data.password;
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