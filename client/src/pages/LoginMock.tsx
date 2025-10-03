import React, { useState } from 'react';

interface LoginMockProps {
  onLogin: (user: string, role: 'civilian' | 'authority') => void;
}

const DEMO_USERS = {
  civilian: [
    { id: 'civilian1', name: 'Matti Virtanen', description: 'Experienced paramedic' },
    { id: 'civilian2', name: 'Liisa Korhonen', description: 'Professional translator' },
  ],
  authority: [
    { id: 'authority1', name: 'Pekka Salminen', description: 'Emergency coordinator' },
  ]
};

export default function LoginMock({ onLogin }: LoginMockProps) {
  const [selectedRole, setSelectedRole] = useState<'civilian' | 'authority'>('civilian');
  const [selectedUser, setSelectedUser] = useState('');

  const handleLogin = () => {
    if (selectedUser) {
      onLogin(selectedUser, selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-finland-blue">
            Kokonaisturvallisuus MVP
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Demo Authentication - Choose your role
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="civilian"
                  checked={selectedRole === 'civilian'}
                  onChange={(e) => {
                    setSelectedRole(e.target.value as 'civilian');
                    setSelectedUser('');
                  }}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">Civilian</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="authority"
                  checked={selectedRole === 'authority'}
                  onChange={(e) => {
                    setSelectedRole(e.target.value as 'authority');
                    setSelectedUser('');
                  }}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">Authority</span>
              </label>
            </div>
          </div>

          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Demo User
            </label>
            <div className="space-y-2">
              {DEMO_USERS[selectedRole].map((user) => (
                <label key={user.id} className="flex items-center">
                  <input
                    type="radio"
                    name="user"
                    value={user.id}
                    checked={selectedUser === user.id}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="form-checkbox"
                  />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-700">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login as {selectedRole === 'civilian' ? 'Civilian' : 'Authority'}
          </button>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>This is a demonstration system with mock authentication.</p>
                  <p className="mt-1">
                    <strong>Civilian:</strong> Submit your profile and capabilities<br />
                    <strong>Authority:</strong> Search and allocate civilian resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
