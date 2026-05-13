const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Query to get tutors with their full names and category information
    const [tutors] = await pool.execute(`
      SELECT t.tutor_id, u.full_name, t.category_id, c.category_name
      FROM tutors t 
      JOIN users u ON t.user_id = u.user_id 
      LEFT JOIN categories c ON t.category_id = c.category_id
      ORDER BY u.full_name
    `);

    res.status(200).json({ tutors });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
}
