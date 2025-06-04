import mysql, { Pool } from 'mysql2/promise';
import { DB_CONFIG } from '.';

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
      ...DB_CONFIG,
      namedPlaceholders: true
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
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
const db = Database.getInstance().getConnection();

export { db };
