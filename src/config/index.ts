import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Configuración de la base de datos
export const DB_CONFIG = {
  host: process.env.DB_HOST || '200.1.179.24',
  user: process.env.DB_USER || 'cron',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'asterisk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Configuración del servidor
export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};
