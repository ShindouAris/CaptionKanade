import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
  token: string | null;
  verifyAccount: (token: string) => Promise<void>;
  submitOtp: (token: string, otp: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState<number | null>(null);

  // Function to parse JWT and get expiration time
  const getTokenExpiration = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return 0;
    }
  };

  // Function to set up token refresh
  const setupTokenRefresh = (token: string) => {
    const expTime = getTokenExpiration(token);
    const currentTime = Date.now();
    const timeUntilRefresh = expTime - currentTime - 5 * 60 * 1000; // Refresh 5 minutes before expiration

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    if (timeUntilRefresh > 0) {
      const timerId = window.setTimeout(async () => {
        try {
          if (!token || !user?.id) {
            console.error('No token or user ID found');
            logout();
            return;
          }

          const response = await fetch(`${API_URL}/v1/user/refresh_token`, {
            method: 'POST',
            body: JSON.stringify({
              token: token,
              account_id: user?.id
            })
          });

          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('auth_token', data.token);
            setupTokenRefresh(data.token);
          } else {
            console.error(`Failed to refresh token: ${response.statusText} - ${response.status}`);
            logout();
          }
        } catch {
          console.error('Failed to refresh token');
          logout();
        }
      }, timeUntilRefresh);

      setRefreshTimer(timerId);
    }
  };

  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      try {
        const expTime = getTokenExpiration(savedToken);
        if (expTime > Date.now()) {
          setToken(savedToken);
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          setUser({
            id: payload.id,
            email: payload.email,
            is_active: payload.is_active,
            is_verified: payload.is_verified
          });
          setupTokenRefresh(savedToken);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "wrong_email_or_password") {
          throw new Error('Email hoặc mật khẩu không chính xác');
        }
        throw new Error(data.detail || 'Đăng nhập thất bại');
      }

      if (!data.data.token) {
        throw new Error('Không nhận được token từ server');
      }

      // Store token first
      setToken(data.data.token);
      localStorage.setItem('auth_token', data.data.token);

      try {
        const [header, payload, signature] = data.data.token.split('.');
        if (!payload) {
          throw new Error('Định dạng token không hợp lệ');
        }

        const decodedPayload = JSON.parse(atob(payload));
        
        if (!decodedPayload.id || !decodedPayload.email) {
          throw new Error('Token payload thiếu các trường bắt buộc');
        }

        setUser({
          id: decodedPayload.id,
          email: decodedPayload.email,
          is_active: decodedPayload.is_active ?? false,
          is_verified: decodedPayload.is_verified ?? false
        });

        setupTokenRefresh(data.data.token);
      } catch (tokenError: any) {
        // If token parsing fails, clean up and throw error
        setToken(null);
        localStorage.removeItem('auth_token');
        throw new Error(`Lỗi phân tích token: ${tokenError.message}`);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Đăng ký thất bại');
      }

      await login(email, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  };

  const getAuthHeader = () => {
    return token ? { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    } : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getAuthHeader,
    token,
    verifyAccount: async (token: string) => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/v1/user/verify_account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to request verification');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    submitOtp: async (token: string, otp: number) => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/v1/user/submit_otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, otp })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Lỗi xác thực OTP');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
