import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../src/components/Button';
import { useAuth } from '../src/contexts/AuthContext';
import authService from '../src/services/authService';

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { email, password });
    
    if (!email || !password) {
      setErrors({ general: 'Email dan password harus diisi' });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Calling authService.login...');
      const result = await authService.login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        login(result.token, result.user);
        router.push('/dashboard');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-videobelajar-cream flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Masuk ke Akun</h1>
          <p className="text-gray-600">Yuk, lanjutin belajarmu di videobelajar.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => {
                console.log('Email input changed:', e.target.value);
                setEmail(e.target.value);
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-videobelajar-green focus:border-transparent border-gray-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => {
                console.log('Password input changed:', e.target.value);
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-videobelajar-green focus:border-transparent border-gray-300"
              required
            />
          </div>
          
          <div className="text-right mb-6">
            <Link href="/forgot-password" className="text-sm text-videobelajar-green hover:underline">
              Lupa Password?
            </Link>
          </div>
          
          <Button type="submit" className="w-full mb-3" disabled={isLoading}>
            {isLoading ? 'Sedang Masuk...' : 'Masuk'}
          </Button>
          
          <Link href="/register">
            <Button variant="secondary" className="w-full mb-4">
              Daftar
            </Button>
          </Link>
          
          <div className="text-center mb-4">
            <span className="text-gray-500">atau</span>
          </div>
          
          <div className="text-center">
            <span className="text-gray-500">Belum punya akun? </span>
            <Link href="/register" className="text-videobelajar-green hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
