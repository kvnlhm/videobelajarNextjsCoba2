import React from 'react';
import '../styles/globals.css';
import { CourseProvider } from '../src/contexts/CourseContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CourseProvider>
        <div className="min-h-screen bg-videobelajar-cream">
          <Header />
          <main>
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </CourseProvider>
    </AuthProvider>
  );
}

export default MyApp;
