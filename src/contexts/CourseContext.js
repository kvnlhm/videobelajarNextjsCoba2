import React, { createContext, useState, useContext } from 'react';

const CourseContext = createContext();

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 3.5,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 2,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 3.0,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 3,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 4.0,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 4,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 3.5,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 5,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 4.5,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 6,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 3.0,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 7,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 4.0,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 8,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 3.5,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    },
    {
      id: 9,
      title: 'Big 4 Auditor Financial Analyst',
      description: 'Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan...',
      instructor: 'Jenna Ortega',
      instructorTitle: 'Senior Accountant di Gojek',
      rating: 5.0,
      price: 'Rp 300K',
      image: '/img1.jpg',
      instructorImage: '/img2.png'
    }
  ]);

  const addCourse = (newCourse) => {
    console.log('Adding course:', newCourse);
    setCourses(prev => {
      const updated = [...prev, { ...newCourse, id: Date.now() }];
      console.log('Updated courses after add:', updated);
      return updated;
    });
  };

  const updateCourse = (id, updatedCourse) => {
    console.log('Updating course:', id, updatedCourse);
    setCourses(prev => {
      const updated = prev.map(course => 
        course.id === id ? { ...course, ...updatedCourse } : course
      );
      console.log('Updated courses after update:', updated);
      return updated;
    });
  };

  const deleteCourse = (id) => {
    console.log('Deleting course:', id);
    setCourses(prev => {
      const updated = prev.filter(course => course.id !== id);
      console.log('Updated courses after delete:', updated);
      return updated;
    });
  };

  const value = {
    courses,
    addCourse,
    updateCourse,
    deleteCourse
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseContext;
