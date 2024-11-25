// models/NewsModel.js
import connectDB from '../config/db.js';

class NewsModel {
  constructor(connection) {
    this.connection = connection;
  }

  async createImages(newsId, images) {
    try {
      const imageValues = images.map((image) => [newsId, image.url]);
  
      const [result] = await this.connection.query(
        "INSERT INTO images (newsId, url) VALUES ?",
        [imageValues]
      );
  
      return result; 
    } catch (error) {
      console.error("Error al insertar imágenes:", error);
      throw error; 
    }
  }
  
  async createNews(title, content) {
    try {
      const [result] = await this.connection.query(
        "INSERT INTO news (title, content) VALUES (?, ?)",
        [title, content]
      );
  
      return result.insertId; 
    } catch (error) {
      console.error("Error al crear noticia:", error);
      throw error; 
    }
  }
  // Obtener todas las noticias con sus imágenes
  async getAllNews() {
    const [rows] = await this.connection.query(
      `SELECT n.*, GROUP_CONCAT(i.url) AS images
       FROM news n
       LEFT JOIN images i ON n.id = i.newsId
       GROUP BY n.id`
    );
    return rows.map((row) => ({
      ...row,
      images: row.images ? row.images.split(',') : [],
    }));
  }

  // Obtener una noticia por su ID
  async getNewsById(id) {
    const [rows] = await this.connection.query(
      `SELECT n.*, GROUP_CONCAT(i.url) AS images
       FROM news n
       LEFT JOIN images i ON n.id = i.newsId
       WHERE n.id = ?
       GROUP BY n.id`,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return {
      ...row,
      images: row.images ? row.images.split(',') : [],
    };
  }

  // Actualizar una noticia
  async updateNews(id, title, content) {
    const [result] = await this.connection.execute(
      'UPDATE news SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    return result;
  }

  // Eliminar una noticia
  async deleteNews(id) {
    const [result] = await this.connection.execute(
      'DELETE FROM news WHERE id = ?',
      [id]
    );
    return result;
  }

  // Método para obtener todas las imágenes de una noticia por su ID
  async getImagesByNewsId(newsId) {
    try {
      const [images] = await this.connection.query("SELECT url FROM images WHERE newsId = ?", [newsId]);
      return images.map((img) => img.url);
    } catch (error) {
      console.error("Error al obtener imágenes por ID de noticia:", error);
      throw error;
    }
  }

  // Método para eliminar una imagen por su URL
  async deleteImageByUrl(url) {
    try {
      const [result] = await this.connection.execute("DELETE FROM images WHERE url = ?", [url]);
      return result;
    } catch (error) {
      console.error("Error al eliminar la imagen por URL:", error);
      throw error;
    }
  }
}


export default async function getNewsModelInstance() {
  const connection = await connectDB();
  return new NewsModel(connection);
}
