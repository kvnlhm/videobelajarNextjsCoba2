import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CrudPage from './pages/CrudPage';
import { CourseProvider } from './contexts/CourseContext';

function App() {
  return (
    <CourseProvider>
      <div className="min-h-screen bg-videobelajar-cream">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/crud" element={<CrudPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CourseProvider>
  );
}

export default App;
