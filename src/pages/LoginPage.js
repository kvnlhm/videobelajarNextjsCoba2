import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect to homepage
          window.location.href = '/';
        } else {
          // Show error message from API
          setLoginError(data.message || 'Login gagal');
        }
      } catch (error) {
        // Handle any network errors (not AxiosError since we're using fetch)
        console.error('Login error:', error);
        setLoginError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <div className="min-h-screen bg-videobelajar-cream flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Masuk ke Akun</h1>
          <p className="text-gray-600">Yuk, lanjutin belajarmu di videobelajar.</p>
        </div>
        
        {/* Login Error Alert */}
        {loginError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-red-700 text-sm">{loginError}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="E-Mail"
            name="email"
            type="email"
            placeholder="Masukkan email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          
          <Input
            label="Kata Sandi"
            name="password"
            type="password"
            placeholder="Masukkan kata sandi"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            showPasswordToggle
          />
          
          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-sm text-videobelajar-green hover:underline">
              Lupa Password?
            </Link>
          </div>
          
          <Button type="submit" className="w-full mb-3">
            Masuk
          </Button>
          
          <Link to="/register">
            <Button variant="secondary" className="w-full mb-4">
              Daftar
            </Button>
          </Link>
          
          <div className="text-center mb-4">
            <span className="text-gray-500">atau</span>
          </div>
          
          <Button variant="google" className="w-full flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Masuk dengan Google
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
