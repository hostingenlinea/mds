// ... imports
const pastoresRoutes = require('./routes/pastores');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth'); // <--- AGREGAR ESTO

// ... middlewares

app.use('/api/auth', authRoutes); // <--- AGREGAR ESTO
app.use('/api/upload', uploadRoutes);
app.use('/api/pastores', pastoresRoutes);

// ... app.listen