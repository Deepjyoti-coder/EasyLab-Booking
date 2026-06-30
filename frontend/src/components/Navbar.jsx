import React from 'react';
import { Stethoscope, CalendarPlus, LayoutDashboard, Settings, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate, isLoggedIn, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-primary-50 p-2 rounded-xl text-primary-600 mr-2.5">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800 block leading-tight">Sunita Lab</span>
              <span className="text-[10px] font-medium text-slate-400 block tracking-wider uppercase">Diagnostic Center</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 sm:space-x-4 items-center">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                currentPage === 'home'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('book')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'book'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
              }`}
            >
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Book Test</span>
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'dashboard'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('manage')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'manage'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Manage Tests</span>
                </button>

                <button
                  onClick={onLogout}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                  currentPage === 'login'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
