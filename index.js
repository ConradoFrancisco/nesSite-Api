// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/authRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';
import newsRouter from './routes/newsRouter.js';

dotenv.config();

const app = express();

// Obtener el equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del servidor para servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
// Servir la carpeta de imágenes


// Rutas
app.use('/api/news', newsRouter);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});