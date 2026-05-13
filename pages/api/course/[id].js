const mysql = require('mysql2/promise');
const { uploadImage } = require('../../../src/utils/cloudinary');
const fs = require('fs');
const path = require('path');
// Check if required environment variables are set
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
  console.error('Missing required database environment variables:');
  console.error('MYSQL_HOST:', process.env.MYSQL_HOST);
  console.error('MYSQL_USER:', process.env.MYSQL_USER);
  console.error('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  throw new Error('Missing required database environment variables');
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  ssl: process.env.MYSQL_HOST && !process.env.MYSQL_HOST.match(/localhost|127\.0\.0\.1/) ? { rejectUnauthorized: false } : undefined,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    throw new Error('Database connection failed');
  });

module.exports = async function handler(req, res) {
  try {
    console.log('=== API REQUEST START ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    
    // Manual body parsing for PATCH requests
    if (req.method === 'PATCH' && !req.body) {
      try {
        const body = await new Promise((resolve, reject) => {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({});
            }
          });
          req.on('error', reject);
        });
        req.body = body;
      } catch (e) {
        req.body = {};
      }
    }
    
    const { id } = req.query;
    
    switch (req.method) {
      case 'GET':
        await handleGet(req, res, id);
        break;
      case 'PATCH':
        await handlePatch(req, res, id);
        break;
      case 'DELETE':
        await handleDelete(req, res, id);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('=== MAIN HANDLER ERROR ===');
    console.error('Error in main handler:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Database connection failed')) {
      return res.status(500).json({ 
        message: 'Database connection error', 
        error: 'Unable to connect to database. Please check database configuration.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.message.includes('Missing required database environment variables')) {
      return res.status(500).json({ 
        message: 'Configuration error', 
        error: 'Database environment variables are not properly configured.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function handleGet(req, res, id) {
  try {
    const [rows] = await pool.query(`
      SELECT pk.*, u.full_name as tutor_name, k.category_name 
      FROM produk_kelas pk
      LEFT JOIN tutors t ON pk.tutor_id = t.tutor_id
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN kategori_kelas k ON pk.category_id = k.category_id
      WHERE pk.class_id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const course = rows[0];
    const transformedCourse = {
      id: course.class_id,
      title: course.class_name,
      description: course.description,
      tutor_id: course.tutor_id,
      instructor: course.tutor_name || 'Tanpa Nama',
      instructorTitle: 'Expert Instructor',
      rating: 4.5,
      price: `Rp ${course.price.toLocaleString('id-ID')}`,
      thumbnail_url: course.thumbnail_url || '/img1.jpg',
      instructorImage: '/img2.png',
      category_id: course.category_id,
      category: course.category_name || 'Tanpa Kategori',
      level: course.difficulty_level,
      duration: course.duration_hours,
      isActive: course.is_active
    };
    
    res.status(200).json(transformedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
}

async function handlePatch(req, res, id) {
  try {
    console.log('=== PATCH DEBUG INFO ===');
    console.log('PATCH request received for ID:', id);
    console.log('Request query params:', req.query);
    console.log('Request headers:', req.headers);
    console.log('Request body raw:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check if ID is valid
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid ID provided:', id);
      return res.status(400).json({ message: 'Invalid course ID provided' });
    }
    
    const { class_name, description, tutor_id, category_id, difficulty_level, duration_hours, price, thumbnail_url, thumbnail_file } = req.body;
    
    console.log('Extracted fields:', {
      class_name, description, tutor_id, category_id, difficulty_level, duration_hours, thumbnail_url, price
    });
    
    // Validate required fields
    if (!class_name || class_name.trim() === '') {
      console.error('Missing or empty class_name');
      return res.status(400).json({ message: 'Class name is required' });
    }
    
    if (!description || description.trim() === '') {
      console.error('Missing or empty description');
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!price || price.toString().trim() === '') {
      console.error('Missing or empty price');
      return res.status(400).json({ message: 'Price is required' });
    }
    
    const priceNumber = typeof price === 'string' ? 
      parseInt(price.replace(/[^\d]/g, '')) : price;
    
    const courseData = {
      class_name: class_name,
      description: description,
      price: priceNumber,
      tutor_id: tutor_id && tutor_id !== '' ? parseInt(tutor_id) : 1,
      category_id: category_id && category_id !== '' ? parseInt(category_id) : 1,
      difficulty_level: difficulty_level || 'Beginner',
      duration_hours: duration_hours || 10,
      thumbnail_url: thumbnail_url,
      is_active: true
    };
    
    console.log('Final course data:', courseData);
    
    // Handle file upload if present
    // Handle file upload if present via Cloudinary
    if (req.body.thumbnail_file && typeof req.body.thumbnail_file === 'object' && req.body.thumbnail_file.data) {
      try {
        console.log('Uploading image to Cloudinary...');
        courseData.thumbnail_url = await uploadImage(req.body.thumbnail_file.data, 'videobelajar_courses');
        console.log('Upload successful, URL:', courseData.thumbnail_url);
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
      }
    }
    
    // Check if course exists before updating
    const [existingCourse] = await pool.query('SELECT class_id FROM produk_kelas WHERE class_id = ?', [id]);
    if (existingCourse.length === 0) {
      console.error('Course not found with ID:', id);
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log('Updating course with data:', courseData);
    console.log('Update query parameters:', [courseData.class_name, courseData.description, courseData.price, courseData.tutor_id, courseData.category_id, courseData.difficulty_level, courseData.duration_hours, courseData.thumbnail_url, courseData.is_active, id]);
    
    const [updateResult] = await pool.query(`
      UPDATE produk_kelas 
      SET class_name = ?, description = ?, price = ?, tutor_id = ?, category_id = ?, difficulty_level = ?, duration_hours = ?, thumbnail_url = ?, is_active = ?
      WHERE class_id = ?
    `, [courseData.class_name, courseData.description, courseData.price, courseData.tutor_id, courseData.category_id, courseData.difficulty_level, courseData.duration_hours, courseData.thumbnail_url, courseData.is_active, id]);
    
    console.log('Update result:', updateResult);
    
    if (updateResult.affectedRows === 0) {
      console.error('No rows were updated for ID:', id);
      return res.status(400).json({ message: 'Failed to update course - no changes made' });
    }
    
    const [updatedCourse] = await pool.query(`
      SELECT pk.*, u.full_name as tutor_name, k.category_name 
      FROM produk_kelas pk
      LEFT JOIN tutors t ON pk.tutor_id = t.tutor_id
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN kategori_kelas k ON pk.category_id = k.category_id
      WHERE pk.class_id = ?
    `, [id]);
    
    const transformedCourse = {
      id: updatedCourse[0].class_id,
      title: updatedCourse[0].class_name,
      description: updatedCourse[0].description,
      tutor_id: updatedCourse[0].tutor_id,
      instructor: updatedCourse[0].tutor_name || 'Tanpa Nama',
      instructorTitle: 'Expert Instructor',
      rating: 4.5,
      price: `Rp ${updatedCourse[0].price.toLocaleString('id-ID')}`,
      thumbnail_url: updatedCourse[0].thumbnail_url || '/img1.jpg',
      instructorImage: '/img2.png',
      category_id: updatedCourse[0].category_id,
      category: updatedCourse[0].category_name || 'Tanpa Kategori',
      level: updatedCourse[0].difficulty_level,
      duration: updatedCourse[0].duration_hours,
      isActive: updatedCourse[0].is_active
    };
    
    res.status(200).json(transformedCourse);
  } catch (error) {
    console.error('=== PATCH ERROR DETAILS ===');
    console.error('Error occurred while updating course ID:', id);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sql:', error.sql);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error stack:', error.stack);
    
    // Handle specific database errors
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Database table not found', error: 'Table produk_kelas does not exist' });
    }
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ message: 'Required field is missing', error: error.sqlMessage });
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Duplicate entry found', error: error.sqlMessage });
    }
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ message: 'Data too long for column', error: error.sqlMessage });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return res.status(400).json({ message: 'Invalid JSON in request body', error: error.message });
    }
    
    // Handle validation errors
    if (error.message.includes('required') || error.message.includes('missing')) {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    
    // Generic error
    res.status(500).json({ 
      message: 'Failed to update course due to server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function handleDelete(req, res, id) {
  try {
    // First, get the course data to find the thumbnail_url
    const [courseRows] = await pool.query('SELECT thumbnail_url FROM produk_kelas WHERE class_id = ?', [id]);
    
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const course = courseRows[0];
    
    // Delete the file from filesystem if it exists and is not a default image
    if (course.thumbnail_url && 
        course.thumbnail_url !== '/img1.jpg' && 
        course.thumbnail_url.startsWith('/uploads/')) {
      
      try {
        const filePath = path.join(process.cwd(), 'public', course.thumbnail_url);
        console.log('Attempting to delete file:', filePath);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted successfully:', course.thumbnail_url);
        } else {
          console.log('File not found, skipping deletion:', filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete the database record
    const [result] = await pool.query('DELETE FROM produk_kelas WHERE class_id = ?', [id]);
    
    if (result.affectedRows > 0) {
      res.status(200).json({ 
        message: 'Course deleted successfully',
        fileDeleted: course.thumbnail_url && course.thumbnail_url !== '/img1.jpg'
      });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error in handleDelete:', error);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
}
