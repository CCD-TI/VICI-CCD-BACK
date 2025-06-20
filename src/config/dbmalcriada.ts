import mysql, { Pool } from 'mysql2/promise';
class DatabMalcriada {
  private static instance: DatabMalcriada;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
        host: process.env.DB_HOST || '192.168.1.182',
        user: process.env.DB_USER || 'paul',
        password: process.env.DB_PASSWORD || 'paulp',
        database: process.env.DB_NAME || 'vicidial',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        namedPlaceholders: true
    });
  }

  public static getInstance(): DatabMalcriada {
    if (!DatabMalcriada.instance) {
      DatabMalcriada.instance = new DatabMalcriada();
    }
    return DatabMalcriada.instance;
  }

  public getConnection(): Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Export a single instance of the database connection
const dbmalcriada = DatabMalcriada.getInstance().getConnection();

export { dbmalcriada };