import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '200.1.179.24',
  user: 'cron',
  password: '1234',
  database: 'asterisk',
});
