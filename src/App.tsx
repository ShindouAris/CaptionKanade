import React, { useState, useEffect } from 'react';
import { Menu, Home, Edit3, BookOpen, Moon, Sun, LogOut } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}

const SidebarContent: React.FC = () => {
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
  ];

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
              <Link to={id}>
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        {/* User Section */}
        {user ? (
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start h-auto p-3" asChild>
              <Link to="/profile">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-xs font-semibold">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user.username ? `@${user.username}` : user.email}
                    </span>
                    {user.is_verified && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        Verified
                      </Badge>
                    )}
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
              Logout
            </Button>
          </div>
        ) : (
          <Button className="w-full bg-pink-500 hover:bg-pink-600" asChild>
            <Link to="/login">Login</Link>
          </Button>
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-background border-r sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
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
          </Layout>
        </CaptionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;