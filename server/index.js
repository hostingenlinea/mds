// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Importar rutas
const pastoresRoutes = require('./routes/pastores');

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/pastores', pastoresRoutes);

app.get('/', (req, res) => {
  res.send('API MDS Global funcionando 🚀');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

// ... otros requires
const uploadRoutes = require('./routes/upload'); // <--- AGREGAR ESTO

// ... app.use(cors()) etc

app.use('/api/upload', uploadRoutes); // <--- AGREGAR ESTO (Antes de pastores)
app.use('/api/pastores', pastoresRoutes);

// ...