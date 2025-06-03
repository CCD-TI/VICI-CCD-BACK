import express from 'express';
import cors from 'cors';
import leadsRoutes from './routes/gestion_historial.routes';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/gestion_historial', leadsRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
