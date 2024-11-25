// middlewares/uploadMiddleware.ts

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/', // Carpeta donde se guardarán las imágenes
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Solo se permiten imágenes en formato JPG o PNG'));
    }
    cb(null, true);
  },
});

export default uploadMiddleware;