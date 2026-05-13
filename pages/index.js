import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../src/components/Button';
import { useCourses } from '../src/hooks/useCourses';
import { useAuth } from '../src/contexts/AuthContext';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {(course.thumbnail_url || course.image) && (course.thumbnail_url || course.image).trim() !== '' ? (
          <img 
            src={course.thumbnail_url || course.image} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/img1.jpg';
              e.target.className = 'w-full h-full object-cover';
            }}
          />
        ) : (
          <img 
            src="/img1.jpg" 
            alt="Default Kelas"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
        <div className="flex items-center mb-2">
          <img 
            src={course.instructorImage} 
            alt={course.instructor}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">{course.instructor}</p>
            <p className="text-xs text-gray-500">{course.instructorTitle}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
          </div>
          <p className="font-semibold text-videobelajar-green">{course.price}</p>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Semua Kelas');
  const [email, setEmail] = useState('');
  const { courses, loading, error } = useCourses();
  const { isAuthenticated, user } = useAuth();
  
  console.log('HomePage courses:', courses);
  
  const categories = ['Semua Kelas', 'Pemasaran', 'Desain', 'Pengembangan Diri', 'Bisnis'];
  
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribed with email:', email);
      setEmail('');
    }
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-videobelajar-dark/80 to-videobelajar-dark/60 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          {isAuthenticated ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Selamat Datang, {user?.fullname || 'User'}! 👋
              </h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Senang belajar di videobelajar. Lanjutkan pembelajaran Anda dan tingkatkan keterampilan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button className="px-8 py-3 text-lg">
                  Jelajahi Kursus
                </Button>
                <Link href="/dashboard">
                  <Button variant="secondary" className="px-6 py-3 text-lg">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/crud">
                  <Button variant="secondary" className="px-6 py-3 text-lg">
                    Manajemen Data
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Revolusi Pembelajaran: Temukan Ilmu Baru melalui Platform Video Interaktif!
              </h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Jelajahi dunia pengetahuan yang luas melalui koleksi video pembelajaran interaktif kami. 
                Ikuti latihan mendalam, dapatkan sertifikat, dan tingkatkan keterampilan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button className="px-8 py-3 text-lg">
                  Temukan Video Course untuk Dipelajari!
                </Button>
                <Link href="/login">
                  <Button variant="secondary" className="px-6 py-3 text-lg">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="px-6 py-3 text-lg bg-videobelajar-orange hover:bg-orange-600">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Course Collection Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Koleksi Video Pembelajaran Unggulan
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!
            </p>
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="bg-videobelajar-green text-white px-4 py-2 rounded-full">
                <span className="font-semibold">{courses.length}</span> Kursus Tersedia
              </div>
              <Link 
                href="/crud"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Kelola Kursus
              </Link>
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center mb-8 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-videobelajar-green text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-videobelajar-green"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded inline-block">
                <strong>Error:</strong> {error}
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada kursus yang tersedia</p>
              <p className="text-gray-400 mt-2">Tambahkan kursus baru melalui halaman CRUD</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="relative py-16 bg-gradient-to-r from-videobelajar-dark/80 to-videobelajar-dark/60">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80)'
          }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Mau Belajar Lebih Banyak?</h2>
            <p className="text-lg mb-8">
              Daftarkan dirimu untuk mendapatkan informasi terbaru dan penawaran spesial dari program-program terbaik videobelajar.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Masukkan Emailmu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-videobelajar-green"
                required
              />
              <Button type="submit" className="px-6 py-3">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
