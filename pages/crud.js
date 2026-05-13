import React from 'react';
import { CourseProvider } from '../src/contexts/CourseContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import CrudPage from '../src/pages/CrudPage';

function Crud() {
  return (
    <AuthProvider>
      <CourseProvider>
        <CrudPage />
      </CourseProvider>
    </AuthProvider>
  );
}

export default Crud;
