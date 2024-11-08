// db.js
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('MySQL connected');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;