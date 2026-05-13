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
    console.error('Categories API Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function handleGet(req, res) {
  try {
    const [categories] = await pool.query('SELECT * FROM kategori_kelas ORDER BY category_name');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
}

async function handlePost(req, res) {
  try {
    const { category_name, description } = req.body;
    
    // Validate required fields
    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category name already exists
    const [existingCategory] = await pool.query(
      'SELECT category_id FROM kategori_kelas WHERE category_name = ?',
      [category_name.trim()]
    );
    
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO kategori_kelas (category_name, description) VALUES (?, ?)',
      [category_name.trim(), description || null]
    );

    const [newCategory] = await pool.query('SELECT * FROM kategori_kelas WHERE category_id = ?', [result.insertId]);
    
    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ message: 'Failed to create category', error: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { category_name, description } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Validate required fields
    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category exists
    const [existingCategory] = await pool.query('SELECT category_id FROM kategori_kelas WHERE category_id = ?', [id]);
    
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category name already exists (excluding current category)
    const [duplicateCategory] = await pool.query(
      'SELECT category_id FROM kategori_kelas WHERE category_name = ? AND category_id != ?',
      [category_name.trim(), id]
    );
    
    if (duplicateCategory.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const [result] = await pool.query(
      'UPDATE kategori_kelas SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name.trim(), description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const [updatedCategory] = await pool.query('SELECT * FROM kategori_kelas WHERE category_id = ?', [id]);
    
    res.status(200).json(updatedCategory[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Check if category is being used by any courses
    const [courseUsage] = await pool.query(
      'SELECT COUNT(*) as count FROM produk_kelas WHERE category_id = ?',
      [id]
    );

    // Check if category is being used by any tutors
    const [tutorUsage] = await pool.query(
      'SELECT COUNT(*) as count FROM tutors WHERE category_id = ?',
      [id]
    );

    if (courseUsage[0].count > 0 || tutorUsage[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category. It is being used by courses or tutors.',
        coursesCount: courseUsage[0].count,
        tutorsCount: tutorUsage[0].count
      });
    }

    const [result] = await pool.query('DELETE FROM kategori_kelas WHERE category_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(400).json({ message: 'Failed to delete category', error: error.message });
  }
}
