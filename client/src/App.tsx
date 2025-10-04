import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuthHeaders, setAuthHeaders, clearAuthHeaders, OfflineQueue } from './lib/api';
import LoginMock from './pages/LoginMock';
import CivilianForm from './pages/CivilianForm';
import AuthorityMap from './pages/AuthorityMap';

function App() {
  const [authState, setAuthState] = useState(getAuthHeaders());
  const [pendingCount, setPendingCount] = useState(0);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const savedAuth = getAuthHeaders();
    if (savedAuth.user && savedAuth.role) {
      setAuthState({ user: savedAuth.user, role: savedAuth.role as 'civilian' | 'authority', isAuthenticated: true });
    }
  }, []);

  useEffect(() => {
    // Update pending count when auth state changes
    setPendingCount(OfflineQueue.getPendingCount());

    // Listen for storage changes (for offline queue updates)
    const handleStorageChange = () => {
      setPendingCount(OfflineQueue.getPendingCount());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for queue changes
    const interval = setInterval(() => {
      setPendingCount(OfflineQueue.getPendingCount());
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [authState]);

  const handleLogin = (user: string, role: 'civilian' | 'authority') => {
    // Store auth headers in localStorage for API requests
    setAuthHeaders(user, role);
    // Update local state
    setAuthState({ user, role, isAuthenticated: true });
  };

  const handleLogout = () => {
    // Clear auth headers from localStorage
    clearAuthHeaders();
    // Update local state
    setAuthState({ isAuthenticated: false });
  };

  // Show login if not authenticated
  if (!authState.user || !authState.role) {
    return <LoginMock onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-finland-blue">
                  Civitas
                </h1>
                <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  {authState.role === 'civilian' ? 'Civilian' : 'Authority'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {pendingCount > 0 && (
                  <div className="flex items-center text-sm text-orange-600">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                    {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route 
              path="/civilian" 
              element={
                authState.role === 'civilian' ? 
                <CivilianForm /> : 
                <Navigate to="/authority" replace />
              } 
            />
            <Route 
              path="/authority" 
              element={
                authState.role === 'authority' ? 
                <AuthorityMap /> : 
                <Navigate to="/civilian" replace />
              } 
            />
            <Route 
              path="/" 
              element={
                <Navigate to={authState.role === 'civilian' ? '/civilian' : '/authority'} replace />
              } 
            />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;
