import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './config/postgres.js';
import { connectMongo } from './config/mongodb.js';

// Import routes
import clientesRoutes from './routes/clientes.routes.js';
import mesasRoutes from './routes/mesas.routes.js';
import platosRoutes from './routes/platos.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import resenasRoutes from './routes/resenas.routes.js';
import preferenciasRoutes from './routes/preferencias.routes.js';
import historialRoutes from './routes/historial.routes.js';
import ventasRoutes from './routes/ventas.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clientes', clientesRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/platos', platosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/preferencias', preferenciasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/ventas', ventasRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Initialize databases and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('All PostgreSQL models were synchronized successfully.');
    
    // Connect to MongoDB
    await connectMongo();
    console.log('MongoDB connection has been established successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
