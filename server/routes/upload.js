const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- CONFIGURACIÓN DE NUBE (Cloudinary) ---
// Si no hay variables, usa credenciales de prueba o lanza error controlado
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pastores_mds', // Nombre de la carpeta en la nube
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optimizar tamaño automáticamente
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('foto'), (req, res) => {
  try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
      }
      // Cloudinary nos devuelve directamente la URL segura (https)
      res.json({ url: req.file.path });
  } catch (error) {
      console.error("Error en subida:", error);
      res.status(500).json({ error: 'Error interno al subir imagen' });
  }
});

module.exports = router;