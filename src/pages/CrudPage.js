import React, { useState, useEffect } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';

const CrudPage = () => {
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    tutor_id: '',
    category_id: '',
    difficulty_level: 'beginner',
    duration_hours: '',
    price: '',
    thumbnail_file: null
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [tutors, setTutors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const { isAuthenticated } = useAuth();
  const { courses, loading, error, fetchCourses, addCourse, updateCourse, deleteCourse } = useCourses();

  // Fetch tutors and categories data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [tutorsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/tutors'),
          fetch('/api/categories')
        ]);
        
        const tutorsData = await tutorsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setTutors(tutorsData.tutors || []);
        setCategories(categoriesData.categories || []);
        setFilteredTutors(tutorsData.tutors || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Ditolak - Login Diperlukan
          </h1>
          <p className="text-gray-600 mb-4">
            Halaman manajemen data kelas hanya dapat diakses oleh pengguna yang sudah login.
          </p>
          <a
            href="/login"
            className="bg-videobelajar-green hover:bg-videobelajar-green text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, filter tutors and reset tutor selection
    if (name === 'category_id') {
      const filtered = value ? tutors.filter(tutor => tutor.category_id === Number.parseInt(value)) : tutors;
      setFilteredTutors(filtered);
      
      // Reset tutor selection when category changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        tutor_id: '' // Reset tutor selection
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        console.log('File converted to base64, length:', base64Data.length);
        console.log('Base64 starts with:', base64Data.substring(0, 50) + '...');
        
        setFormData(prev => ({
          ...prev,
          thumbnail_file: {
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data
          },
          thumbnail_url: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data for API - include file info if available
      const submitData = {
        class_name: formData.class_name,
        description: formData.description,
        tutor_id: formData.tutor_id,
        category_id: formData.category_id,
        difficulty_level: formData.difficulty_level,
        duration_hours: formData.duration_hours,
        price: formData.price,
        thumbnail_url: formData.thumbnail_url,
        thumbnail_file: formData.thumbnail_file
      };

      if (editingId) {
        await updateCourse(editingId, submitData);
        setEditingId(null);
      } else {
        await addCourse(submitData);
        // Refresh data after successful addition
        await fetchCourses();
      }

      setFormData({
        class_name: '',
        description: '',
        tutor_id: '',
        category_id: '',
        difficulty_level: 'beginner',
        duration_hours: '',
        price: '',
        thumbnail_url: '',
        thumbnail_file: null
      });
      setFilteredTutors(tutors); // Reset filtered tutors to all tutors
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };

  const handleEdit = (course) => {
    // First set the form data
    setFormData({
      class_name: course.class_name || course.title || '',
      description: course.description || '',
      tutor_id: course.tutor_id || course.instructor || '',
      category_id: course.category_id || course.category || '',
      difficulty_level: course.difficulty_level || course.level || 'beginner',
      duration_hours: course.duration_hours || course.duration || '',
      price: course.price || '',
      thumbnail_url: course.thumbnail_url || course.image || '',
      thumbnail_file: null
    });
    
    // Filter tutors based on the course's category
    const categoryId = course.category_id || course.category || '';
    const filtered = categoryId ? tutors.filter(tutor => tutor.category_id === Number.parseInt(categoryId)) : tutors;
    setFilteredTutors(filtered);
    
    setEditingId(course.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteCourse(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  const handleCancel = () => {
    setFormData({
      class_name: '',
      description: '',
      tutor_id: '',
      category_id: '',
      difficulty_level: 'beginner',
      duration_hours: '',
      price: '',
      thumbnail_url: '',
      thumbnail_file: null
    });
    setFilteredTutors(tutors); // Reset filtered tutors to all tutors
    setEditingId(null);
    setIsModalOpen(false);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Manajemen Data Kelas
      </h1>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Add Button */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Kelas
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="class_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  id="class_name"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  disabled={loadingDropdowns}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
                {loadingDropdowns && (
                  <p className="mt-1 text-xs text-gray-500">Memuat data kategori...</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tutor_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Tutor
                </label>
                <select
                  id="tutor_id"
                  name="tutor_id"
                  value={formData.tutor_id}
                  onChange={handleInputChange}
                  required
                  disabled={loadingDropdowns}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Tutor</option>
                  {filteredTutors.map((tutor) => (
                    <option key={tutor.tutor_id} value={tutor.tutor_id}>
                      {tutor.full_name} {tutor.category_name ? `(${tutor.category_name})` : '(Belum ada kategori)'}
                    </option>
                  ))}
                </select>
                {loadingDropdowns && (
                  <p className="mt-1 text-xs text-gray-500">Memuat data tutor...</p>
                )}
              </div>

              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Pemula</option>
                  <option value="intermediate">Menengah</option>
                  <option value="advanced">Lanjutan</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (Jam)
                </label>
                <input
                  type="number"
                  id="duration_hours"
                  name="duration_hours"
                  value={formData.duration_hours}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Harga
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Rp 300K"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="thumbnail_file" className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar Thumbnail
                </label>
                <input
                  type="file"
                  id="thumbnail_file"
                  name="thumbnail_file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-videobelajar-orange file:text-white hover:file:bg-videobelajar-green"
                />
                {formData.thumbnail_file && (
                  <p className="mt-2 text-sm text-gray-600">
                    File dipilih: {formData.thumbnail_file.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleCancel();
                    setIsModalOpen(false);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm transition duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow-sm transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (editingId ? 'Update Data' : 'Simpan Data')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Data Kelas
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Kelas</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tutor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tingkat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Durasi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Harga</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">Tidak ada data kelas</p>
                          <p className="text-gray-400 text-sm mt-1">Tambahkan kelas baru untuk memulai</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    courses.map((course, index) => (
                      <tr key={course.id} className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {(course.thumbnail_url || course.image) && (course.thumbnail_url || course.image).trim() !== '' ? (
                                <img
                                  src={course.thumbnail_url || course.image}
                                  alt={course.class_name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.src = '/img1.jpg';
                                    e.target.className = 'w-12 h-12 object-cover rounded-lg border border-gray-200';
                                  }}
                                />
                              ) : (
                                <img
                                  src="/img1.jpg"
                                  alt="Default Kelas"
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {course.class_name || 'Tanpa Nama'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {course.description || 'Tidak ada deskripsi'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-900 font-medium">{course.instructor || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {course.category || course.category_id || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(course.difficulty_level || course.level) === 'beginner' ? 'bg-green-100 text-green-800' :
                              (course.difficulty_level || course.level) === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {(course.difficulty_level || course.level) === 'beginner' ? 'Pemula' :
                              (course.difficulty_level || course.level) === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration_hours || course.duration} jam
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-green-600">
                            {course.price}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(course)}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Total <span className="font-medium">{courses.length}</span> kelas
                </p>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors">
                    Previous
                  </button>
                  <span className="px-3 py-1 text-xs bg-blue-600 text-white rounded">1</span>
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Statistik Data</h3>
            <p className="text-gray-700">
              Total Kursus: <span className="font-bold">{courses.length}</span>
            </p>
            <p className="text-gray-700">
              Total Kelas: <span className="font-bold">{courses.length}</span>
            </p>
          </div>
        </div>
      );
};

      export default CrudPage;
