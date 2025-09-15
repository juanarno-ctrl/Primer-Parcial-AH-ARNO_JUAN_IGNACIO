
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';

import authRoutes from './routes/auth.routes.js';
import pokemonRoutes from './routes/pokemon.routes.js';
import typesRoutes from './routes/types.routes.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a Mongo
await connectDB(process.env.MONGODB_URI);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/types', typesRoutes);

// 404 JSON para API
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

// Página principal
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:3000`));
