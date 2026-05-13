const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Query to get all categories
    const [categories] = await pool.execute(`
      SELECT category_id, category_name 
      FROM kategori_kelas 
      ORDER BY category_name
    `);

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
}
