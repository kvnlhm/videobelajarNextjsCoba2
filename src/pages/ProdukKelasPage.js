import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import Button from '../components/Button';

const ProdukKelasPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { users: courses, loading: coursesLoading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedLevel, setSelectedLevel] = useState('Semua Level');

  // Check if user is authenticated
  useEffect(() => {
    console.log('ProdukKelasPage - authLoading:', authLoading, 'user:', user);
    if (!authLoading && !user) {
      // Redirect to login page or show access denied
      console.log('Redirecting to login...');
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua Kategori' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Semua Level' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Silakan login untuk melihat halaman ini</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Videobelajar Theme */}
      <div className="bg-gradient-to-r from-videobelajar-green to-green-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Semua Produk Kelas</h1>
              <p className="text-green-100">Temukan kelas yang sesuai dengan kebutuhan belajar Anda</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Selamat datang,</p>
              <p className="text-lg font-semibold">{user.name || 'User'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section - Videobelajar Theme */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-videobelajar-green"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-videobelajar-green"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="1">Pemasaran</option>
                <option value="2">Desain</option>
                <option value="3">Pengembangan Diri</option>
                <option value="4">Bisnis</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-videobelajar-green"
              >
                <option value="Semua Level">Semua Level</option>
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan <span className="font-semibold">{filteredCourses.length}</span> dari{' '}
            <span className="font-semibold">{courses.length}</span> kelas
          </p>
        </div>

        {/* Table Layout - Matching Reference Images */}
        {filteredCourses.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-videobelajar-orange text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Produk Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tingkat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {course.image && course.image.trim() !== '' ? (
                            <img 
                              className="h-16 w-16 rounded-lg object-cover" 
                              src={course.image} 
                              alt={course.title}
                              onError={(e) => {
                                e.target.src = '/img1.jpg';
                              }}
                            />
                          ) : (
                            <img 
                              className="h-16 w-16 rounded-lg object-cover" 
                              src="/img1.jpg" 
                              alt="Default Kelas"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.description}</div>
                          <div className="flex items-center mt-1">
                            {course.instructorImage && course.instructorImage.trim() !== '' ? (
                              <img 
                                className="h-6 w-6 rounded-full mr-2" 
                                src={course.instructorImage} 
                                alt={course.instructor}
                                onError={(e) => {
                                  e.target.src = '/img2.png';
                                }}
                              />
                            ) : (
                              <img 
                                className="h-6 w-6 rounded-full mr-2" 
                                src="/img2.png" 
                                alt="Default Instructor"
                              />
                            )}
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-videobelajar-orange text-white">
                        {course.category === '1' ? 'Pemasaran' : 
                         course.category === '2' ? 'Desain' :
                         course.category === '3' ? 'Pengembangan Diri' : 'Bisnis'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level === 'beginner' ? 'Pemula' : 
                         course.level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.duration} jam
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        className="bg-videobelajar-green hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                        onClick={() => window.location.href = `/kelas/${course.id}`}
                      >
                        Lihat Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kelas ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdukKelasPage;
