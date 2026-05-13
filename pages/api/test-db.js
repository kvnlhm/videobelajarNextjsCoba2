import mysql from 'mysql2';

export default async function handler(req, res) {
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined
    }).promise();

    // Test connection
    const [rows] = await pool.query('SELECT 1 as test');
    
    res.status(200).json({ 
      message: 'Database connection successful',
      env: {
        MYSQL_HOST: process.env.MYSQL_HOST,
        MYSQL_USER: process.env.MYSQL_USER,
        MYSQL_database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***' : 'not set'
      },
      result: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message,
      env: {
        MYSQL_HOST: process.env.MYSQL_HOST,
        MYSQL_USER: process.env.MYSQL_USER,
        MYSQL_database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined,
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***' : 'not set'
      }
    });
  }
}
