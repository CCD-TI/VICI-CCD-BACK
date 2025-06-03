import { RequestHandler } from "express";
import { db } from '../db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const login: RequestHandler = async (req, res): Promise<void> => {
  const { user, password } = req.body;

  try {
    const [rows]: any = await db.query(
      'SELECT user, pass, full_name, user_level FROM vicidial_users WHERE user = ? LIMIT 1',
      [String(user)]
    );

    if (rows.length === 0) {
      res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
      return;
    }

    const userData = rows[0];

    // Comparación directa de texto plano
    const inputPassword = String(password);
    const dbPassword = String(userData.pass);

    if (inputPassword !== dbPassword) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    // Generación del token
    const token = jwt.sign(
      {
        user: String(userData.user),
        full_name: String(userData.full_name),
        user_level: Number(userData.user_level),
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: userData });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno en login' });
  }
};
