import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { USER_ROLES } from '@edusphere/shared';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  const isStudent = user?.roles.includes(USER_ROLES.STUDENT);
  const isTutor = user?.roles.includes(USER_ROLES.TUTOR);

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
                className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.roles.map((role) => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {isStudent && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Enrollments</h2>
              <p className="text-gray-600 mb-4">
                Track your enrolled courses and continue learning.
              </p>
              <Link
                to="/enrollments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                View Enrollments
              </Link>
            </div>
          )}

          {isTutor && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
              <p className="text-gray-600 mb-4">Manage your courses and track student progress.</p>
              <div className="space-x-4">
                <Link
                  to="/tutor/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  My Courses
                </Link>
                <Link
                  to="/tutor/courses/create"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Create Course
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Courses</h2>
            <p className="text-gray-600 mb-4">
              Discover new courses and expand your knowledge.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Explore Courses
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
            <p className="text-gray-600 mb-4">Update your profile and preferences.</p>
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
