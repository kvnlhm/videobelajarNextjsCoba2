import React, { useState, useEffect } from 'react';
import { useTutors } from '../hooks/useTutors';
import { useAuth } from '../contexts/AuthContext';

const TutorCrudPage = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    bio: '',
    expertise: '',
    rating: '0.00',
    experience_years: '0',
    category_id: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [tutorUsers, setTutorUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const { isAuthenticated } = useAuth();
  const { tutors, loading, error, fetchTutors, addTutor, updateTutor, deleteTutor } = useTutors();

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [usersResponse, categoriesResponse] = await Promise.all([
          fetch('/api/tutor-users'),
          fetch('/api/categories')
        ]);
        
        const usersData = await usersResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setTutorUsers(usersData.tutorUsers || []);
        setCategories(categoriesData.categories || []);
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
            Halaman manajemen data tutor hanya dapat diakses oleh pengguna yang sudah login.
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        rating: parseFloat(formData.rating) || 0,
        experience_years: parseInt(formData.experience_years) || 0,
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      };

      if (editingId) {
        await updateTutor(editingId, submitData);
        setEditingId(null);
      } else {
        await addTutor(submitData);
        await fetchTutors();
      }

      setFormData({
        user_id: '',
        bio: '',
        expertise: '',
        rating: '0.00',
        experience_years: '0',
        category_id: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving tutor:', err);
    }
  };

  const handleEdit = (tutor) => {
    setFormData({
      user_id: tutor.user_id?.toString() || '',
      bio: tutor.bio || '',
      expertise: tutor.expertise || '',
      rating: tutor.rating?.toString() || '0.00',
      experience_years: tutor.experience_years?.toString() || '0',
      category_id: tutor.category_id?.toString() || ''
    });
    setEditingId(tutor.tutor_id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteTutor(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
    } catch (err) {
      console.error('Error deleting tutor:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  const handleCancel = () => {
    setFormData({
      user_id: '',
      bio: '',
      expertise: '',
      rating: '0.00',
      experience_years: '0',
      category_id: ''
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  if (loading && tutors.length === 0) {
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
        Manajemen Data Tutor
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
          disabled={tutorUsers.length === 0 && !editingId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-200 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {!editingId && (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
          {editingId ? 'Edit Tutor' : 'Tambah Tutor'}
        </button>
        {tutorUsers.length === 0 && !editingId && (
          <span className="ml-4 text-sm text-gray-500">
            Tidak ada pengguna dengan role tutor yang tersedia
          </span>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Tutor' : 'Tambah Tutor Baru'}
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
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Pengguna Tutor
                </label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                  disabled={loadingDropdowns || !!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Pengguna</option>
                  {tutorUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
                {loadingDropdowns && (
                  <p className="mt-1 text-xs text-gray-500">Memuat data pengguna...</p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bio tutor (opsional)"
                />
              </div>

              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                  Keahlian
                </label>
                <input
                  type="text"
                  id="expertise"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Web Development, React, Node.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                    Pengalaman (Tahun)
                  </label>
                  <input
                    type="number"
                    id="experience_years"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Spesialisasi
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
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
                  Apakah Anda yakin ingin menghapus tutor ini? Tindakan ini tidak dapat dibatalkan.
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
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Data Tutor
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Tutor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bio & Keahlian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating & Pengalaman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tutors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">Tidak ada data tutor</p>
                      <p className="text-gray-400 text-sm mt-1">Tambahkan tutor baru untuk memulai</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tutors.map((tutor, index) => (
                  <tr key={tutor.tutor_id} className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                {tutor.full_name ? tutor.full_name.charAt(0) : '?'}
                            </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tutor.full_name || 'Tanpa Nama'}
                          </p>
                          <p className="text-xs text-gray-500">{tutor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {tutor.bio || 'Tidak ada bio'}
                        </p>
                        {tutor.expertise && (
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Keahlian:</strong> {tutor.expertise}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(tutor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{tutor.rating || '0.00'}</span>
                        {tutor.experience_years > 0 && (
                          <span className="ml-2 text-xs text-gray-500">({tutor.experience_years} tahun)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tutor.category_name ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tutor.category_name || 'Belum ada kategori'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(tutor)}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tutor.tutor_id)}
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
              Total <span className="font-medium">{tutors.length}</span> tutor
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
          Total Tutor: <span className="font-bold">{tutors.length}</span>
        </p>
        <p className="text-gray-700">
          Rating Rata-rata: <span className="font-bold">
            {tutors.length > 0 
              ? tutors
                  .filter(tutor => tutor.rating !== null && tutor.rating !== undefined && !Number.isNaN(tutor.rating))
                  .reduce((sum, tutor) => sum + Number.parseFloat(tutor.rating), 0) / 
                  tutors.filter(tutor => tutor.rating !== null && tutor.rating !== undefined && !Number.isNaN(tutor.rating)).length
                  .toFixed(2)
              : '0.00'
            }
          </span>
        </p>
      </div>
    </div>
  );
};

export default TutorCrudPage;
