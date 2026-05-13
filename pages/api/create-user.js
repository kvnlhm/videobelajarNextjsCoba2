import bcrypt from 'bcrypt';
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullname, username, email, password } = req.body;
    
    if (!fullname || !username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(`
      SELECT email, username FROM users WHERE email = ? OR username = ?
    `, [email, username]);
    
    const existingUser = existingUsers.find(user => user.email === email || user.username === username);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(`
      INSERT INTO users (full_name, username, email, password, verification_token, is_verified, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [fullname, username, email, hashedPassword, null, true, 'student']);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, fullname, username, email, is_verified: true }
    });
  } catch (error) {
    res.status(500).json({ message: 'User creation failed', error: error.message });
  }
}
