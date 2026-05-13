const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
      case 'PATCH':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function handleGet(req, res) {
  try {
    const { id } = req.query;
    if (id) {
        const [users] = await pool.query('SELECT user_id, username, email, role, full_name, phone_number, is_verified, created_at, updated_at FROM users WHERE user_id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(users[0]);
    }

    const [users] = await pool.query('SELECT user_id, username, email, role, full_name, phone_number, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
}

async function handlePost(req, res) {
  try {
    const { username, email, password, role, full_name, phone_number } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Username, email, password, and role are required' });
    }

    // Check if username or email already exists
    const [existingUser] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username.trim(), email.trim()]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, full_name, phone_number, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username.trim(), email.trim(), hashedPassword, role, full_name || null, phone_number || null, 1] // Set is_verified to 1 for admin created users by default
    );

    const [newUser] = await pool.query('SELECT user_id, username, email, role, full_name, phone_number, is_verified, created_at, updated_at FROM users WHERE user_id = ?', [result.insertId]);
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: 'Failed to create user', error: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { username, email, password, role, full_name, phone_number, is_verified } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const [existingUser] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email already exists for other users
    if (username || email) {
      const [duplicateUser] = await pool.query(
        'SELECT user_id FROM users WHERE (username = ? OR email = ?) AND user_id != ?',
        [username?.trim(), email?.trim(), id]
      );
      
      if (duplicateUser.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }

    let updateQuery = 'UPDATE users SET ';
    const updateParams = [];
    const updates = [];

    if (username) { updates.push('username = ?'); updateParams.push(username.trim()); }
    if (email) { updates.push('email = ?'); updateParams.push(email.trim()); }
    if (role) { updates.push('role = ?'); updateParams.push(role); }
    if (full_name !== undefined) { updates.push('full_name = ?'); updateParams.push(full_name); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); updateParams.push(phone_number); }
    if (is_verified !== undefined) { updates.push('is_verified = ?'); updateParams.push(is_verified ? 1 : 0); }
    
    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updates.push('password = ?');
        updateParams.push(hashedPassword);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    updateQuery += updates.join(', ') + ' WHERE user_id = ?';
    updateParams.push(id);

    await pool.query(updateQuery, updateParams);

    const [updatedUser] = await pool.query('SELECT user_id, username, email, role, full_name, phone_number, is_verified, created_at, updated_at FROM users WHERE user_id = ?', [id]);
    
    res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Failed to update user', error: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Don't allow deleting the last admin
    const [userToDelete] = await pool.query('SELECT role FROM users WHERE user_id = ?', [id]);
    if (userToDelete.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete[0].role === 'admin') {
        const [adminCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        if (adminCount[0].count <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last admin user' });
        }
    }

    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ message: 'Failed to delete user', error: error.message });
  }
}
