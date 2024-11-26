// controllers/NewsController.js
import getNewsModelInstance from "../models/NewsModel.js";
import path from "path";
import fs from "fs";

class NewsController {
  constructor(newsModel) {
    this.newsModel = newsModel;
  }

  // Método para crear una noticia
  create = async (req, res, next) => {
    try {
      const { title, content, author, date } = req.body;
      const files = req.files;

      // Validación de datos obligatorios
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "El título y el contenido son obligatorios" });
      }

      // Procesar las imágenes
      const images = files
        ? files.map((file) => ({ url: `/uploads/${file.filename}` }))
        : [];

      // Crear la noticia en la base de datos
      const newsId = await this.newsModel.createNews(
        title,
        content,
        author,
        date
      );

      // Asociar las imágenes con la noticia si hay imágenes
      if (images.length > 0) {
        const result = await this.newsModel.createImages(newsId, images);
        console.log(`Se insertaron ${result.affectedRows} imágenes.`);
      }

      // Respuesta exitosa
      res.status(201).json({ message: "Noticia creada con éxito", newsId });
    } catch (error) {
      console.error("Error al crear la noticia:", error);
      next(error); // Manejo del error
    }
  };

  // Método para obtener todas las noticias
  async getAll(req, res, next) {
    try {
      const offset = parseInt(req.query.offset, 10) || 0;
      const limit = parseInt(req.query.limit, 10) || 10;
      const title = req.query.title || undefined;
      const status = req.query.status !== undefined ? parseInt(req.query.status, 10) : undefined;
      const startDate = req.query.startDate || undefined;
      const endDate = req.query.endDate || undefined;
  
      const { news, total } = await this.newsModel.getAllNews(offset, limit, title, status, startDate, endDate);
  
      res.json({ noticias:news, total });
    } catch (error) {
      next(error);
    }
  }
  getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const news = await this.newsModel.getNewsById(id);

      if (!news) {
        return res.status(404).json({ message: "Noticia no encontrada" });
      }

      res.json(news);
    } catch (error) {
      next(error);
    }
  };

  // Método para actualizar una noticia existente
  update = async (req, res, next) => {
    try {
      console.log("Received req.body:", req.body);
      console.log("Received req.files:", req.files);

      const newsId = parseInt(req.params.id, 10);
      if (isNaN(newsId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const { title, content, author, date, existingImages } = req.body;

      // Validación de campos obligatorios
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "El título y el contenido son obligatorios" });
      }

      // Procesar nuevas imágenes
      const newImages = req.files
        ? req.files.map((file) => ({ url: `/uploads/${file.filename}` }))
        : [];
      console.log("New images to add:", newImages);

      // Procesar imágenes existentes
      let imagesToKeep = [];
      if (Array.isArray(existingImages)) {
        imagesToKeep = existingImages;
      } else if (typeof existingImages === "string") {
        try {
          imagesToKeep = JSON.parse(existingImages);
        } catch (e) {
          imagesToKeep = [];
          console.error("Error parsing existingImages:", e);
        }
      }
      console.log("Images to keep (before adding new images):", imagesToKeep);

      // Actualizar campos de la noticia
      await this.newsModel.updateNews(newsId, title, content, author, date);

      // Agregar nuevas imágenes a la base de datos
      if (newImages.length > 0) {
        const result = await this.newsModel.createImages(newsId, newImages);
        console.log(`Inserted ${result.affectedRows} new images.`);
      }

      // Obtener las imágenes actuales desde la base de datos (incluyendo las recién añadidas)
      const currentImages = await this.newsModel.getImagesByNewsId(newsId);
      console.log(
        "Current images in DB (after adding new images):",
        currentImages
      );

      // Actualizar imágenes a mantener: incluir las nuevas imágenes recién añadidas
      imagesToKeep = [...imagesToKeep, ...newImages.map((img) => img.url)];
      console.log("Images to keep (after adding new images):", imagesToKeep);

      // Determinar imágenes a eliminar: aquellas en currentImages que no están en imagesToKeep
      const imagesToDelete = currentImages.filter(
        (img) => !imagesToKeep.includes(img)
      );
      console.log("Images to delete:", imagesToDelete);

      // Eliminar imágenes no mantenidas
      for (const imageUrl of imagesToDelete) {
        await this.newsModel.deleteImageByUrl(imageUrl);

        // Eliminar el archivo físico
        const filePath = path.join(process.cwd(), imageUrl); // Asegúrate de que esta ruta sea correcta
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting image file: ${filePath}`, err);
          } else {
            console.log(`Deleted image file: ${filePath}`);
          }
        });
      }
      // Respuesta exitosa
      res.json({ message: "Noticia actualizada con éxito" });
    } catch (error) {
      console.error("Error updating news:", error);
      next(error); // Manejo del error
    }
  };

  // Método para eliminar una imagen específica (si decides mantenerlo separado)
  deleteImage = async (req, res, next) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL de la imagen requerida" });
      }

      // Eliminar la imagen de la base de datos
      await this.newsModel.deleteImageByUrl(url);

      // Eliminar el archivo físico del servidor
      const filePath = path.join(process.cwd(), url); // Ajusta según tu estructura
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo de imagen:", err);
          // No lanzamos el error aquí para no interrumpir el flujo principal
        }
      });

      res.json({ message: "Imagen eliminada con éxito" });
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      next(error);
    }
  };
  deleteNew = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "id invalida" });
      }
      // Eliminar la imagen de la base de datos
      await this.newsModel.deleteNews(id);

      res.json({ message: "Noticia eliminada con éxito" });
    } catch (error) {
      console.error("Error al eliminar la noticia:", error);
      next(error);
    }
  };

  setStateNew = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!id) {
        return res.status(400).json({ message: "id invalida" });
      }
      // Eliminar la imagen de la base de datos
      await this.newsModel.setState(status,id);

      if(status === 1){
        res.json({ message: "Noticia publicada con éxito" });
      }else{
        res.json({ message: "Noticia dada de baja" });
      }
      
    } catch (error) {
      console.error("Error al eliminar la noticia:", error);
      next(error);
    }
  };
}

  // Método para obtener una noticia por ID
 


// Factory para crear la instancia del controlador
export async function createNewsController() {
  const newsModel = await getNewsModelInstance();
  return new NewsController(newsModel);
}
