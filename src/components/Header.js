import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-videobelajar-orange">
            videobelajar
          </Link>
          <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl md:text-3xl font-bold text-videobelajar-orange">
          videobelajar
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-videobelajar-green focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Manajemen Data - compact with dropdown */}
          <div className="relative group" ref={dropdownRef}>
            <button
              className="flex items-center px-4 py-2 text-gray-700 hover:text-videobelajar-green transition-colors font-medium"
            >
              Manajemen Data
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link 
                href="/crud"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Produk Kelas
              </Link>
              <Link 
                href="/category-crud"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Kategori
              </Link>
              <Link 
                href="/tutor-crud"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Tutor
              </Link>
              <Link 
                href="/users-crud"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Users
              </Link>
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden hover:bg-gray-400 transition-all"
              >
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user?.fullname || user?.username || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/img2.png';
                    }}
                  />
                ) : (
                  <img 
                    src="/img2.png" 
                    alt="Default User"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link 
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profil
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-videobelajar-green border border-videobelajar-green rounded-lg hover:bg-videobelajar-green hover:text-white transition-colors font-medium">
                Masuk
              </Link>
              <Link href="/register" className="px-4 py-2 bg-videobelajar-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 shadow-inner">
          <div className="flex flex-col space-y-3 pb-3">
            <div className="font-medium text-gray-800 pt-2 pb-1 border-b border-gray-100">Manajemen Data</div>
            <Link href="/crud" className="pl-4 text-gray-600 hover:text-videobelajar-green" onClick={() => setIsMobileMenuOpen(false)}>Produk Kelas</Link>
            <Link href="/category-crud" className="pl-4 text-gray-600 hover:text-videobelajar-green" onClick={() => setIsMobileMenuOpen(false)}>Kategori</Link>
            <Link href="/tutor-crud" className="pl-4 text-gray-600 hover:text-videobelajar-green" onClick={() => setIsMobileMenuOpen(false)}>Tutor</Link>
            <Link href="/users-crud" className="pl-4 text-gray-600 hover:text-videobelajar-green" onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
            
            {isAuthenticated ? (
              <>
                <div className="font-medium text-gray-800 pt-3 pb-1 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
                    <img src={user?.profile_image || '/img2.png'} alt="User" className="w-full h-full object-cover" />
                  </div>
                  {user?.fullname || 'Profil Saya'}
                </div>
                <Link href="/profile" className="pl-4 text-gray-600 hover:text-videobelajar-green" onClick={() => setIsMobileMenuOpen(false)}>Profil Lengkap</Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="pl-4 text-left text-red-500 hover:text-red-700">Keluar</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <Link href="/login" className="text-center py-2 text-videobelajar-green border border-videobelajar-green rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Masuk</Link>
                <Link href="/register" className="text-center py-2 bg-videobelajar-green text-white rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
