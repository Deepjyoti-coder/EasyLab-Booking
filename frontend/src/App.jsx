import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookTest from './pages/BookTest';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageTests from './pages/ManageTests';

// Set up dynamic backend API URL based on environment
const BACKEND_URL = 
  window.location.port && window.location.port !== '5000'
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : '';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleNavigate = (page) => {
    // Auth guards
    const restrictedPages = ['dashboard', 'manage'];
    if (restrictedPages.includes(page) && !localStorage.getItem('adminToken')) {
      setCurrentPage('login');
      return;
    }
    
    // Redirect logic: if already logged in and going to login, send to dashboard
    if (page === 'login' && localStorage.getItem('adminToken')) {
      setCurrentPage('dashboard');
      return;
    }

    setCurrentPage(page);
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem('adminToken', token);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  // Render current page component
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'book':
        return <BookTest backendUrl={BACKEND_URL} />;
      case 'login':
        return <Login backendUrl={BACKEND_URL} onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return <Dashboard backendUrl={BACKEND_URL} />;
      case 'manage':
        return <ManageTests backendUrl={BACKEND_URL} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-300">© 2026 Sunita Diagnostic Laboratory. All rights reserved.</p>
          <p className="text-xs text-slate-500 mt-1.5">Providing Quality Medical Diagnostics Direct to Your Home.</p>
        </div>
      </footer>
    </div>
  );
}
