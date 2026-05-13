const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
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
            default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function handleGet(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT pk.*, u.full_name as tutor_name 
      FROM produk_kelas pk
      LEFT JOIN tutors t ON pk.tutor_id = t.tutor_id
      LEFT JOIN users u ON t.user_id = u.user_id
    `);
    
    // If no data in database, return sample data
    if (rows.length === 0) {
      const sampleCourses = [
        {
          id: 1,
          title: 'Big 4 Auditor Financial Analyst',
          description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
          instructor: 'Jenna Ortega',
          instructorTitle: 'Senior Accountant di Gojek',
          rating: 3.5,
          price: 'Rp 300K',
          image: '/img1.jpg',
          instructorImage: '/img2.png'
        },
        {
          id: 2,
          title: 'Digital Marketing Mastery',
          description: 'Pelajari strategi marketing digital yang efektif untuk bisnis Anda...',
          instructor: 'John Doe',
          instructorTitle: 'Marketing Expert',
          rating: 4.5,
          price: 'Rp 250K',
          image: '/img1.jpg',
          instructorImage: '/img2.png'
        },
        {
          id: 3,
          title: 'Web Development Bootcamp',
          description: 'Belajar web development dari dasar hingga mahir dengan proyek nyata...',
          instructor: 'Jane Smith',
          instructorTitle: 'Full Stack Developer',
          rating: 4.8,
          price: 'Rp 500K',
          image: '/img1.jpg',
          instructorImage: '/img2.png'
        }
      ];
      return res.status(200).json(sampleCourses);
    }
    
    const transformedCourses = rows.map(course => ({
      id: course.class_id,
      title: course.class_name,
      description: course.description,
      instructor: course.tutor_name || 'Tanpa Nama',
      instructorTitle: 'Expert Instructor',
      rating: 4.5,
      price: `Rp ${course.price.toLocaleString('id-ID')}`,
      thumbnail_url: course.thumbnail_url || '/img1.jpg',
      instructorImage: '/img2.png',
      category: course.category_id,
      level: course.difficulty_level,
      duration: course.duration_hours,
      isActive: course.is_active
    }));
    
    res.status(200).json(transformedCourses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
}

async function handlePost(req, res) {
  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const { class_name, description, tutor_id, category_id, difficulty_level, duration_hours, price, thumbnail_url, thumbnail_file } = req.body;
    
    // Validate required fields
    if (!class_name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields: class_name, description, price' });
    }
    
        
    const priceNumber = typeof price === 'string' ? 
      parseInt(price.replace(/[^\d]/g, '')) : price;
    
    // Handle file upload - save file to filesystem
    let finalThumbnailUrl = thumbnail_url || '/img1.jpg';
    
    // Check if thumbnail_file exists and has name property
    if (thumbnail_file && typeof thumbnail_file === 'object' && thumbnail_file.name && thumbnail_file.name.trim().length > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(thumbnail_file.name);
        const uniqueFilename = `${timestamp}${fileExtension}`;
        
        // Save the actual file to filesystem
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        // Handle different base64 formats
        let base64Data = thumbnail_file.data;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1]; // Remove data:image/type;base64, prefix
        }
        
        const fileBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, fileBuffer);
        
        // Save the filename to database
        finalThumbnailUrl = `/uploads/${uniqueFilename}`;
        
        // Log file upload success
        console.log('File uploaded successfully:', uniqueFilename);
        console.log('File path:', filePath);
        console.log('File size:', fileBuffer.length, 'bytes');
        
        // Verify file was written correctly
        const stats = fs.statSync(filePath);
        console.log('Actual file size on disk:', stats.size, 'bytes');
      } catch (fileError) {
        console.error('Error handling file upload:', fileError);
        finalThumbnailUrl = thumbnail_file.name; // Fallback to original name
      }
    }
    
    const courseData = {
      class_name: class_name,
      description: description,
      price: priceNumber,
      tutor_id: tutor_id || 1,
      category_id: category_id || 1,
      difficulty_level: difficulty_level || 'Beginner',
      duration_hours: duration_hours || 10,
      thumbnail_url: finalThumbnailUrl,
      is_active: true
    };
    
    const [result] = await pool.query(`
      INSERT INTO produk_kelas (class_name, description, price, tutor_id, category_id, difficulty_level, duration_hours, thumbnail_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [courseData.class_name, courseData.description, courseData.price, courseData.tutor_id, courseData.category_id, courseData.difficulty_level, courseData.duration_hours, courseData.thumbnail_url, courseData.is_active]);
    
    const [newCourse] = await pool.query(`
      SELECT pk.*, u.full_name as tutor_name 
      FROM produk_kelas pk
      LEFT JOIN tutors t ON pk.tutor_id = t.tutor_id
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE pk.class_id = ?
    `, [result.insertId]);
    
    const transformedCourse = {
      id: newCourse[0].class_id,
      title: newCourse[0].class_name,
      description: newCourse[0].description,
      instructor: newCourse[0].tutor_name || 'Tanpa Nama',
      instructorTitle: 'Expert Instructor',
      rating: 4.5,
      price: `Rp ${newCourse[0].price.toLocaleString('id-ID')}`,
      thumbnail_url: newCourse[0].thumbnail_url || '/img1.jpg',
      instructorImage: '/img2.png'
    };
    
    res.status(201).json(transformedCourse);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create course', error: error.message });
  }
}

