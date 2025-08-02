import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Edit3, BookOpen, Moon, Sun, User } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import CaptionBuilder from './components/CaptionBuilder';
import CaptionLibrary from './components/CaptionLibrary';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './components/UserPage';
import EmailVerification from './components/EmailVerification';
import ResetPassword from './components/ResetPassword';
import { CaptionProvider } from './contexts/CaptionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('captionkanade-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Hiển thị thông báo khi người dùng truy cập vào trang
      console.log(
        "%cChờ chút",
        "color: blue; font-size: 40px; font-weight: bold;"
      )
      console.log(
    "%cNếu bạn muốn sử dụng api của CaptionKanade, hãy apply với admin tại discord: https://discord.chisadin.site để được cung cấp quyền truy cập api chính thống và documents",
    "color: black; font-size: 18px; font-weight: bold; font-style: italic; background: #ffdcff;"
    );
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('captionkanade-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('captionkanade-theme', 'light');
    }
  };

  const navigation = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/builder', label: 'Caption Builder', icon: Edit3 },
    { id: '/library', label: 'Library', icon: BookOpen },
  ];

  // Không hiển thị navigation trên trang đăng nhập và đăng ký
  if (['/login', '/register', '/verify-email', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-pink-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                CaptionKanade
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                to={id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === id
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  <User size={20} />
                  <span className="hidden md:inline">{user.username ? `@${user.username}` : user.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400"
              >
                Login
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-pink-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                to={id}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  location.pathname === id
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CaptionProvider>
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-300">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Navigation />
            
            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/builder" element={
                  <ProtectedRoute>
                    <CaptionBuilder />
                  </ProtectedRoute>
                } />
                
                <Route path="/library" element={
                  <ProtectedRoute>
                    <CaptionLibrary />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute requireVerified>
                    <UserPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </CaptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;