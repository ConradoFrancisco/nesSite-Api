// models/NewsModel.js
import connectDB from "../config/db.js";

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

  async createNews(title, content,author,date) {
    try {
      const [result] = await this.connection.query(
        "INSERT INTO news (title, content,author,date) VALUES (?, ?, ?, ?)",
        [title, content,author,date]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error al crear noticia:", error);
      throw error;
    }
  }
  // Obtener todas las noticias con sus imágenes
  async getAllNews(offset, limit, title, status, startDate, endDate) {
    const conditions = [];
    const params = [];
  
    if (title) {
      conditions.push("n.title LIKE ?");
      params.push(`%${title}%`);
    }
  
    if (status !== undefined) {
      conditions.push("n.status = ?");
      params.push(status);
    }
  
    if (startDate) {
      conditions.push("n.date >= ?");
      params.push(startDate);
    }
  
    if (endDate) {
      conditions.push("n.date <= ?");
      params.push(endDate);
    }
  
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  
    const query = `
      SELECT 
    n.*, 
    GROUP_CONCAT(i.url) AS images
FROM 
    news n
LEFT JOIN 
    images i 
ON 
    n.id = i.newsId
${whereClause}
GROUP BY 
    n.id
ORDER BY 
    n.id DESC
LIMIT 
    ?, ?;
    `;
    
    params.push(offset, limit);
  
    const [rows] = await this.connection.query(query, params);
  
    // Agregar consulta para contar filas
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM news n
      ${whereClause}
    `;
    
    const [countResult] = await this.connection.query(countQuery, params.slice(0, -2)); // Eliminar offset y limit para contar todas las filas
  
    return {
      news: rows.map((row) => ({
        ...row,
        images: row.images ? row.images.split(",") : [],
      })),
      total: countResult[0].total,
    };
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
      images: row.images ? row.images.split(",") : [],
    };
  }

  // Actualizar una noticia
  async updateNews(id, title, content, author, date) {
    const [result] = await this.connection.execute(
      "UPDATE news SET title = ?, content = ? , author = ?, date = ? WHERE id = ? ",
      [title, content, author, date, id]
    );
    return result;
  }

  // Eliminar una noticia
  async deleteNews(id) {
    const [result] = await this.connection.execute(
      "DELETE FROM news WHERE id = ?",
      [id]
    );
    return result;
  }

  async setState(status,id) {
    const [result] = await this.connection.execute(
      "UPDATE news SET status = ? WHERE id = ?",
      [status,id]
    );
    return result;
  }

  // Método para obtener todas las imágenes de una noticia por su ID
  async getImagesByNewsId(newsId) {
    try {
      const [images] = await this.connection.query(
        "SELECT url FROM images WHERE newsId = ?",
        [newsId]
      );
      return images.map((img) => img.url);
    } catch (error) {
      console.error("Error al obtener imágenes por ID de noticia:", error);
      throw error;
    }
  }

  // Método para eliminar una imagen por su URL
  async deleteImageByUrl(url) {
    try {
      const [result] = await this.connection.execute(
        "DELETE FROM images WHERE url = ?",
        [url]
      );
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
