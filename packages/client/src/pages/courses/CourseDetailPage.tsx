import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

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
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Course Details</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">Course ID: {courseId}</p>
          <p className="text-sm text-gray-500">
            Course details page with enrollment button, lessons list, instructor info, and video
            player will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
