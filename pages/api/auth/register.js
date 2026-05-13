import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined
}).promise();


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullname, username, password, email } = req.body;
    
    if (!fullname || !username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existingUsers] = await pool.query(`
      SELECT email, username FROM users WHERE email = ? OR username = ?
    `, [email, username]);
    
    const existingUser = existingUsers.find(user => user.email === email || user.username === username);
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    
    const [result] = await pool.query(`
      INSERT INTO users (full_name, username, email, password, verification_token, is_verified, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [fullname, username, email, hashedPassword, verificationToken, false, 'student']);

    // Email verification skipped for simplicity
    console.log(`User registered: ${email} (verification skipped)`);

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: { id: result.insertId, fullname, username, email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}
