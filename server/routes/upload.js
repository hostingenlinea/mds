// server/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 1. Configuración de Multer (Memoria temporal)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. Configuración de MinIO (S3)
const s3Client = new S3Client({
  region: 'us-east-1', // MinIO usa esto por defecto
  endpoint: process.env.S3_ENDPOINT, // Ej: https://minio.tudominio.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // Importante para MinIO
});

// 3. Ruta POST para subir imagen
router.post('/', upload.single('foto'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No se envió ninguna imagen' });

  // Nombre único para el archivo: timestamp-nombre
  const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read' // En MinIO moderno se configura el bucket como público desde la consola
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construir la URL pública manualmente
    // Si usas MinIO, la URL suele ser: ENDPOINT / BUCKET / FILENAME
    const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

    res.json({ url: publicUrl });

  } catch (error) {
    console.error("Error subiendo a MinIO:", error);
    res.status(500).json({ error: 'Error al subir imagen al servidor' });
  }
});

module.exports = router;