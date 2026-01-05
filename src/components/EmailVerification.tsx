import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyAccount, submitOtp, user, logout } = useAuth();
  
  // Get email from navigation state, user context, or URL params
  const email = location.state?.email || user?.email || '';

  // Initialize token and request initial verification
  useEffect(() => {
    const initializeVerification = async () => {
      try {
        // Try to get token from URL params first, then localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const storedToken = localStorage.getItem('access_token');
        const verificationToken = urlToken || storedToken;
        
        if (!verificationToken) {
          setError('No verification token found. Please register again.');
          return;
        }

        setToken(verificationToken);
        
        // Request verification code to be sent
        await verifyAccount(verificationToken);
        setSuccess('Verification code sent to your email.');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize verification';
        setError(errorMessage);
        console.error('Verification initialization error:', err);
      }
    };

    initializeVerification();
  }, []); // Remove dependencies to run only once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Mã xác thực không tìm thấy, vui lòng thử lại.');
      return;
    }

    if (!verificationCode.trim()) {
      setError('Vui lòng nhập mã xác thực.');
      return;
    }

    // Validate code format (assuming it should be numeric)
    const codeInput = verificationCode.trim(); // vẫn là string

    // Kiểm tra chỉ chứa số thôi
    if (!/^\d+$/.test(codeInput)) {
      setError('Mã xác thực phải là số');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await submitOtp(token, codeInput);
      setIsVerified(true);
      setSuccess('Tài khoản đã được xác minh thành công!...');
      
      // Redirect to login after 2 seconds
      logout();
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Xác thực thất bại';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!token) {
      setError('Không có mã xác thực hợp lệ, vui lòng đăng kí lại.');
      return;
    }

    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      await verifyAccount(token);
      setSuccess('Mã mới đã được gửi tới email của bạn!');
      setVerificationCode(''); // Clear the input
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gửi mã thất bại';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Success screen
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 px-4">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-pink-100 dark:border-gray-700 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Tài khoản đã xác thực!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Tài khoản của bạn đã được xác thực thành công
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đang chuyển đến màn hình login...
          </p>
          <div className="mt-4">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-pink-100 dark:border-gray-700">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-900">
            <Mail className="h-8 w-8 text-pink-600 dark:text-pink-300" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Xác thực tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {email ? (
              <>
                Bọn tui đã gửi mã đến email{' '}
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  {email}
                </span>
              </>
            ) : (
              'Vui lòng nhập mã xác thực đã gửi trong email của bạn'
            )}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã xác thực
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // Only allow digits
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:placeholder-gray-400 text-center text-xl tracking-widest font-mono"
              placeholder="XXXXXX"
              maxLength={6}
              disabled={isLoading || isResending}
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || isResending || !token || !verificationCode.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang xác minh tài khoản...
                </>
              ) : (
                'Xác nhận'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || isResending || !token}
                className="text-sm font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center transition-colors"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Không nhận được mã? Thử gửi lại lần nữa
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                Quay lại đăng kí
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;