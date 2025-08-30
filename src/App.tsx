import React, { useState, useEffect } from 'react';
import { Menu, Home, Edit3, BookOpen, Moon, Sun, LogOut, HelpCircle, MessageCircle, Flame } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MdOutlineCollectionsBookmark } from "react-icons/md";
import HomePage from './components/HomePage';
import CaptionBuilder from './components/CaptionBuilder';
import CaptionLibrary from './components/CaptionLibrary';
import Tutorial from './components/Tutorial';
import Trending from './components/Trending';
import ContactPage from './components/ContactPage';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './components/UserPage';
import EmailVerification from './components/EmailVerification';
import ResetPassword from './components/ResetPassword';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NotFoundPage from './components/404';
import { CaptionProvider } from './contexts/CaptionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BadgeCheckIcon } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}

const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
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

  const navigation: NavigationItem[] = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/builder', label: 'Caption Studio', icon: Edit3 },
    { id: '/library', label: 'Library', icon: BookOpen },
    { id: '/trending', label: 'Trending', icon: Flame },
    { id: '/tutorial', label: 'Hướng dẫn', icon: HelpCircle },
    { id: '/contact', label: 'Liên hệ', icon: MessageCircle },
  ];

  const beta_page: NavigationItem[] = [
    {id: '#', label: "Quản lý bộ sưu tập", icon: MdOutlineCollectionsBookmark}
  ]

  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <Link 
          to="/" 
          className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
        >
          CaptionKanade
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={location.pathname === id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-12 px-4",
                location.pathname === id && "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/40"
              )}
              asChild
            >
              <Link to={id} onClick={onNavigate}>
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      {/* Beta Pages - Đang phát triển */}
      <div className="px-4 mt-2 mb-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tính năng thử nghiệm
        </div>
        <div className="space-y-1">
          {beta_page.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              disabled
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 px-4 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-400 dark:hover:text-gray-500"
              )}
              style={{
                pointerEvents: "none"
              }}
              asChild
            >
              <span>
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        {/* User Section */}
        {user ? (
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
              <Link to="/profile" onClick={onNavigate}>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-xs font-semibold">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user.username ? `@${user.username}` : user.email.slice(0, 20)}
                    </span>
                    <div className="flex items-center gap-[5px]">
                      {user.is_verified && (
                        <Badge variant="secondary" className="bg-green-500 text-white dark:bg-green-600 px-1 py-0 text-[10px] h-5 flex items-center">
                          <BadgeCheckIcon className="w-3 h-3 mr-1" />
                        </Badge>
                      )}
                      {user?.id === "0fd2189f-1873-42bb-b2c8-6443772d12e3" && (
                        <Badge variant="secondary" className="text-xs px-2 py-0 bg-gradient-to-r from-pink-300 to-blue-300 text-white h-5 flex items-center">
                          Admin - Developer
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full bg-pink-500 hover:bg-pink-600" asChild>
              <Link to="/login" onClick={onNavigate}>Đăng nhập</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/register" onClick={onNavigate}>Đăng ký</Link>
            </Button>
          </div>
        )}

        {/* Theme Toggle */}
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <>
              <Sun className="mr-3 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-3 h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  // Không hiển thị sidebar trên trang đăng nhập và đăng ký
  if (['/login', '/register', '/verify-email', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  // Function để đóng sidebar trên mobile
  const handleMobileNavigate = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-background border-r sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={handleMobileNavigate} />
        </SheetContent>
      </Sheet>
    </>
  );
};

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const location = useLocation();

  // Không hiển thị topbar trên trang đăng nhập và đăng ký
  if (['/login', '/register', '/verify-email', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="lg:hidden bg-background/80 backdrop-blur-lg border-b sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </Sheet>
        
        <Link 
          to="/" 
          className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
        >
          CaptionKanade
        </Link>
        
        <div className="w-10"></div>
      </div>
    </header>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-100 to-indigo-500 dark:from-blue-900 dark:via-purple-900 dark:to-green-300 transition-all duration-300">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
          <TopBar toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
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

  return (
    <Router>
      <AuthProvider>
        <CaptionProvider>
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
          
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/" element={
                  <HomePage />
              } />
              
              <Route path="/builder" element={
                <ProtectedRoute requireVerified>
                  <CaptionBuilder />
                </ProtectedRoute>
              } />
              
              <Route path="/library" element={
                  <CaptionLibrary />
              } />
              <Route path="/trending" element={
                  <Trending />
              } />
              
              <Route path="/tutorial" element={
                  <Tutorial />
              } />
              
              <Route path="/contact" element={
                  <ContactPage />
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute requireVerified>
                  <UserPage />
                </ProtectedRoute>
              } />
              
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              
              {/* 404 Route - Must be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </CaptionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;