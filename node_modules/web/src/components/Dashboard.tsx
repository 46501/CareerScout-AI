import React from 'react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">CareerScout AI</h1>
          <nav className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">Opportunities</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Profile</a>
            <a href="#" className="text-primary-600 font-medium">AI Assistant</a>
          </nav>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Your AI-powered career opportunity scout is ready.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
