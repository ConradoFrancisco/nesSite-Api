// createRootUser.js
import pkg from 'bcryptjs';
const { hash } = pkg;
import connectDB from '../config/db.js';

const createRootUser = async () => {
  try {
    const connection = await connectDB();

    // Verificar si ya existe un usuario root
    const [rows] = await connection.execute("SELECT * FROM users WHERE role = 'admin'");
    if (rows.length > 0) {
      console.log('Root user already exists');
      await connection.end();
      return;
    }

    // Crear nuevo usuario root
    const hashedPassword = await hash('admin', 10);
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['root', 'conradofrancisco96@gmail.com', hashedPassword, 'admin']
    );

    console.log('Root user created with ID:', result.insertId);
    await connection.end();
  } catch (error) {
    console.error('Error creating root user:', error.message);
  }
};

createRootUser();
