import React from 'react';
import { Link } from 'react-router-dom';

const CoursesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                EduSphere
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/courses"
                className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Courses
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Courses</h1>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">
            Course listing will be implemented here using React Query to fetch courses from the
            API.
          </p>
          <p className="text-sm text-gray-500">
            Features: Search, filters by category/level, pagination, course cards
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
