import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please login to access dashboard
          </h1>
          <p className="text-gray-600">
            <a href="/login" className="text-videobelajar-green hover:underline">
              Click here to login
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-videobelajar-orange p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Selamat Datang, {user?.fullname || 'User'}! 👋
            </h1>
            <p className="text-videobelajar-100">
              Senang belajar di videobelajar. Lanjutkan pembelajaran Anda dan tingkatkan keterampilan.
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Profile Card */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-videobelajar-green rounded-full p-3">
                    <span className="text-white text-lg font-medium">
                      {user?.fullname?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      {user?.fullname || 'User'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Kursus</span>
                    <span className="font-semibold text-gray-800">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Aktif</span>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Selesai</span>
                    <span className="font-semibold text-gray-800">4</span>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-blue-500 rounded-full p-3">
                    <span className="text-white text-lg font-medium">
                      📚
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Kursus Saya
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Kursus</span>
                    <span className="font-semibold text-gray-800">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Aktif</span>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Selesai</span>
                    <span className="font-semibold text-gray-800">4</span>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-purple-500 rounded-full p-3">
                    <span className="text-white text-lg font-medium">
                      🏆
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Progress Belajar
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Jam Belajar</span>
                    <span className="font-semibold text-gray-800">24.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Diselesaikan</span>
                    <span className="font-semibold text-gray-800">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Sertifikat</span>
                    <span className="font-semibold text-gray-800">2</span>
                  </div>
                </div>
              </div>

              {/* Target Card */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-full p-3">
                    <span className="text-white text-lg font-medium">
                      🎯
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Target Mingguan
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Kursus Target</span>
                    <span className="font-semibold text-gray-800">5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
