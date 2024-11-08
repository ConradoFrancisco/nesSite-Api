// models/UserModel.js
import connectDB from '../config/db.js';

class UserModel {
  constructor(connection) {
    this.connection = connection;
  }

  // Encontrar usuario por email
  async findByEmail(email) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0]; // Devuelve el usuario o undefined
  }

  async findByName(name) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );
    return rows[0]; // Devuelve el usuario o undefined
  }

  // Crear un nuevo usuario
  async createUser(name, email, password, role = 'user') {
    const [result] = await this.connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId; // Devuelve el ID del usuario creado
  }

  // Actualizar contraseña
  async updatePassword(id, newPassword) {
    const [result] = await this.connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    return result;
  }
}

export default async function getUserModelInstance() {
  const connection = await connectDB();
  return new UserModel(connection);
}
