
import { db } from '../../config/db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/index';

export class AuthController {
  login = async (req: any, res: any) => {
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
          userId: userData.user,
          userLevel: userData.user_level 
        } as object,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );
  
      res.json({
        message: 'Login exitoso',
        token,
        user: {
          username: userData.user,
          fullName: userData.full_name,
          userLevel: userData.user_level
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno en login' });
    }
  };
}
