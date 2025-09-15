import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-orange-500/20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-500">
                Symbolic AI Dashboard
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              Welcome, {profile?.full_name || user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Persona Segment</label>
                  <p className="text-white">{profile?.persona_segment || 'Not selected'}</p>
                </div>
                {profile?.organization_name && (
                  <div>
                    <label className="text-sm text-gray-400">Organization</label>
                    <p className="text-white">{profile.organization_name}</p>
                  </div>
                )}
                {profile?.organization_size && (
                  <div>
                    <label className="text-sm text-gray-400">Organization Size</label>
                    <p className="text-white">{profile.organization_size} employees</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200">
                  Explore Demos
                </button>
                <button className="w-full bg-[#121212] border border-gray-600 text-white py-2 px-4 rounded-lg hover:border-orange-500 transition-all duration-200">
                  View Services
                </button>
                <button className="w-full bg-[#121212] border border-gray-600 text-white py-2 px-4 rounded-lg hover:border-orange-500 transition-all duration-200">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
