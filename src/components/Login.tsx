import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLoginSection } from './SystemComponent/GoogleLoginSection';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const { googleLogin, isGoogleLoading } = useGoogleAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // if (!turnstileToken) {
    //   setError('Vui lòng xác thực captcha.');
    //   setIsLoading(false);
    //   return;
    // }
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-50 dark:from-gray-900 dark:via-accent/10 dark:to-indigo-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-primary/10 dark:border-gray-700">
        <div>
          <img src="/avatar.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full" />
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Chào mừng trở lại
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Đăng nhập để truy cập caption của bạn
          </p>
          <p className="text-center text-red-600 dark:text-red-300">
            Đây là web ứng dụng riêng với locket nên bạn vẫn cần tạo tk khi chưa có🌹💃🔥🌺💐🌼
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:placeholder-gray-400"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:placeholder-gray-400"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link 
                to="/register" 
                className="font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
              >
                Chưa có tài khoản?
              </Link>
            </div>
            <div className="text-sm">
              <Link 
                to="/reset-password" 
                className="font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          {/* Google Login Section */}
          <GoogleLoginSection
            onGoogleLogin={googleLogin}
            isGoogleLoading={isGoogleLoading}
            disabled={isLoading}
          />
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <Link 
              to="/privacy" 
              className="hover:text-primary dark:hover:text-primary transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/terms" 
              className="hover:text-primary dark:hover:text-primary transition-colors"
            >
              Điều khoản dịch vụ
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/contact" 
              className="hover:text-primary dark:hover:text-primary transition-colors"
            >
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
