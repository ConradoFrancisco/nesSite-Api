// controllers/AuthController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import getUserModelInstance from '../models/UserModel.js';
import nodemailer from 'nodemailer';
import { UserDto } from '../dtos/UserDto.js';

dotenv.config();

class AuthController {
  constructor() {
    this.initialize();
  }

  async initialize() {
    this.userModel = await getUserModelInstance();
  }

  // Iniciar sesión
  async login(req, res) {
    try {
      const { name, password } = req.body;

      const user = await this.userModel.findByName(name);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      const User = new UserDto(user)
      res.json({User,token});
    } catch (error) {
      console.error('Error en login:', error.message);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }

  // Registrar usuario
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await this.userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'El correo ya está en uso' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await this.userModel.createUser(name, email, hashedPassword);

      res.status(201).json({ message: 'Usuario registrado', userId });
    } catch (error) {
      console.error('Error en register:', error.message);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }

  // Solicitar restablecimiento de contraseña
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await this.userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Configurar el transporte de nodemailer con Mailtrap
      const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASSWORD
        }
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const mailOptions = {
        from: 'no-reply@example.com', // Remitente ficticio en desarrollo
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `<p>Hola ${user.name},</p>
               <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>Si no solicitaste este correo, puedes ignorarlo.</p>`,
      };

      await transport.sendMail(mailOptions);

      res.json({ message: 'Correo de restablecimiento enviado' });
    } catch (error) {
      console.error('Error en forgotPassword:', error.message);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }

  // Restablecer contraseña
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      if(userId){
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userModel.updatePassword(userId, hashedPassword);
        res.json({ message: 'Contraseña restablecida exitosamente' });
      }else{
        res.status(400).json({ message: 'token invalido' });
      }

    } catch (error) {
      console.error('Error en resetPassword:', error.message);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }
}

export default new AuthController();
