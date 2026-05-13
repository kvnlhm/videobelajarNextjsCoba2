const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\\.0\\.0\\.1/) ? { rejectUnauthorized: false } : undefined
});

module.exports = async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tutors API Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function handleGet(req, res) {
  try {
    const [tutors] = await pool.query(`
      SELECT t.tutor_id, t.user_id, u.full_name, u.email, t.bio, t.expertise, 
             t.rating, t.experience_years, t.category_id, c.category_name, t.created_at
      FROM tutors t 
      JOIN users u ON t.user_id = u.user_id 
      LEFT JOIN categories c ON t.category_id = c.category_id 
      ORDER BY u.full_name
    `);
    res.status(200).json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Failed to fetch tutors', error: error.message });
  }
}

async function handlePost(req, res) {
  try {
    const { user_id, bio, expertise, rating, experience_years, category_id } = req.body;
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists and is a tutor
    const [userCheck] = await pool.query(
      'SELECT user_id, role FROM users WHERE user_id = ?',
      [user_id]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (userCheck[0].role !== 'tutor') {
      return res.status(400).json({ message: 'User must have tutor role' });
    }

    // Check if tutor already exists for this user
    const [existingTutor] = await pool.query(
      'SELECT tutor_id FROM tutors WHERE user_id = ?',
      [user_id]
    );
    
    if (existingTutor.length > 0) {
      return res.status(400).json({ message: 'Tutor already exists for this user' });
    }

    // Validate category_id if provided
    if (category_id) {
      const [categoryCheck] = await pool.query(
        'SELECT category_id FROM categories WHERE category_id = ?',
        [category_id]
      );
      
      if (categoryCheck.length === 0) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO tutors (user_id, bio, expertise, rating, experience_years, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, bio || null, expertise || null, rating || 0.00, experience_years || 0, category_id || null]
    );

    const [newTutor] = await pool.query(`
      SELECT t.tutor_id, t.user_id, u.full_name, u.email, t.bio, t.expertise, 
             t.rating, t.experience_years, t.category_id, c.category_name, t.created_at
      FROM tutors t 
      JOIN users u ON t.user_id = u.user_id 
      LEFT JOIN categories c ON t.category_id = c.category_id 
      WHERE t.tutor_id = ?
    `, [result.insertId]);
    
    res.status(201).json(newTutor[0]);
  } catch (error) {
    console.error('Error creating tutor:', error);
    res.status(400).json({ message: 'Failed to create tutor', error: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { user_id, bio, expertise, rating, experience_years, category_id } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Tutor ID is required' });
    }

    // Check if tutor exists
    const [existingTutor] = await pool.query('SELECT tutor_id FROM tutors WHERE tutor_id = ?', [id]);
    
    if (existingTutor.length === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Validate user_id if provided and different from current
    if (user_id) {
      const [userCheck] = await pool.query(
        'SELECT user_id, role FROM users WHERE user_id = ?',
        [user_id]
      );
      
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (userCheck[0].role !== 'tutor') {
        return res.status(400).json({ message: 'User must have tutor role' });
      }

      // Check if another tutor already exists for this user
      const [duplicateTutor] = await pool.query(
        'SELECT tutor_id FROM tutors WHERE user_id = ? AND tutor_id != ?',
        [user_id, id]
      );
      
      if (duplicateTutor.length > 0) {
        return res.status(400).json({ message: 'Tutor already exists for this user' });
      }
    }

    // Validate category_id if provided
    if (category_id) {
      const [categoryCheck] = await pool.query(
        'SELECT category_id FROM categories WHERE category_id = ?',
        [category_id]
      );
      
      if (categoryCheck.length === 0) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    const [result] = await pool.query(
      'UPDATE tutors SET user_id = ?, bio = ?, expertise = ?, rating = ?, experience_years = ?, category_id = ? WHERE tutor_id = ?',
      [user_id, bio, expertise, rating || 0.00, experience_years || 0, category_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const [updatedTutor] = await pool.query(`
      SELECT t.tutor_id, t.user_id, u.full_name, u.email, t.bio, t.expertise, 
             t.rating, t.experience_years, t.category_id, c.category_name, t.created_at
      FROM tutors t 
      JOIN users u ON t.user_id = u.user_id 
      LEFT JOIN categories c ON t.category_id = c.category_id 
      WHERE t.tutor_id = ?
    `, [id]);
    
    res.status(200).json(updatedTutor[0]);
  } catch (error) {
    console.error('Error updating tutor:', error);
    res.status(400).json({ message: 'Failed to update tutor', error: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Tutor ID is required' });
    }

    // Check if tutor exists
    const [existingTutor] = await pool.query('SELECT tutor_id FROM tutors WHERE tutor_id = ?', [id]);
    
    if (existingTutor.length === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Check if tutor is teaching any courses
    const [courseUsage] = await pool.query(
      'SELECT COUNT(*) as count FROM produk_kelas WHERE tutor_id = ?',
      [id]
    );

    if (courseUsage[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tutor. They are currently teaching courses.',
        coursesCount: courseUsage[0].count
      });
    }

    const [result] = await pool.query('DELETE FROM tutors WHERE tutor_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    res.status(200).json({ message: 'Tutor deleted successfully' });
  } catch (error) {
    console.error('Error deleting tutor:', error);
    res.status(400).json({ message: 'Failed to delete tutor', error: error.message });
  }
}
