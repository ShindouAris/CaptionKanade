import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import Turnstile from 'react-turnstile';
const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const siteKey = import.meta.env.VITE_TURNSTILE_PUBLICKEY;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!turnstileToken) {
      setError('Vui lòng xác thực captcha.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/v1/user/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          turnstile_token: turnstileToken
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (data.message === 'This account is not register yet!') {
          setError('Tài khoản không tồn tại!');
          return;
        }
        setError(data.message || `HTTP error! status: ${response.status}`);
        return;
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.status === 'success') {
          setStep('verify');
        } else {
          setError(data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu');
        }
      } else {
        throw new Error("Server didn't return JSON");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!turnstileToken) {
      setError('Vui lòng xác thực captcha.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/v1/user/submit_reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otp,
          new_password: newPassword,
          turnstile_token: turnstileToken
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.status === 'success') {
          navigate('/login');
        } else {
          setError(data.error || 'Không thể đặt lại mật khẩu');
        }
      } else {
        throw new Error("Server didn't return JSON");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-pink-100 dark:border-gray-700">
        <div>
          <img src="/avatar.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full" />
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {step === 'request' ? 'Đặt lại mật khẩu' : 'Xác nhận mã OTP'}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {step === 'request' 
              ? 'Nhập email của bạn để nhận mã xác nhận' 
              : 'Nhập mã OTP và mật khẩu mới của bạn'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={step === 'request' ? handleRequestReset : handleSubmitReset}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:placeholder-gray-400"
                  placeholder="Nhập email của bạn"
                  disabled={step === 'verify'}
                />
              </div>
            </div>

            {step === 'request' && (
              <div>
                <Turnstile
                  sitekey={siteKey}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  className="my-2 flex justify-center"
                />
              </div>
            )}
            {step === 'verify' && (
              <div>
                <Turnstile
                  sitekey={siteKey}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  className="my-2 flex justify-center"
                />
              </div>
            )}

            {step === 'verify' && (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                    Mã OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:placeholder-gray-400"
                      placeholder="Nhập mã OTP"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:placeholder-gray-400"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link 
                to="/login" 
                className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 'request' ? 'Gửi mã xác nhận' : 'Đặt lại mật khẩu'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 