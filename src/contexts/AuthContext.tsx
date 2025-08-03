import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  posted_count: number;
  favorites_received: number;
  favorites_given: number;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  register: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  logout: () => void;
  setUsername: (username: string) => Promise<void>;
  getAuthHeader: () => { Authorization: string } | {};
  token: string | null;
  verifyAccount: (token: string) => Promise<void>;
  submitOtp: (token: string, otp: number) => Promise<void>;
  getUserInfo: () => Promise<User | null>;
  userInfo: User | null;
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
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [next_token, setNextToken] = useState<string | null>(null);

  // Function to parse JWT and get expiration time
  const getTokenExpiration = (token: string | null): number => {
    try {
      if (!token) {
        return 0;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return 0;
    }
  };

  // Function to set up token refresh
  const setupTokenRefresh = () => {
    const token = localStorage.getItem('auth_token');
    const expTime = getTokenExpiration(token);
    const currentTime = Date.now();
    
    // If token is expired or will expire in less than 5 minutes, refresh immediately
    if (expTime <= currentTime + 5 * 60 * 1000) {
      refreshToken();
      return;
    }

    const timeUntilRefresh = expTime - currentTime - 5 * 60 * 1000; // Refresh 5 minutes before expiration

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const timerId = window.setTimeout(refreshToken, timeUntilRefresh);
    setRefreshTimer(timerId);
  };

  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('auth_token');
      
      // Decode current token to get latest user data
      if (!currentToken) {
        console.error('No token found in localStorage');
        logout();
        return;
      }

      try {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        if (!payload.id) {
          console.error('Invalid token payload - no user ID');
          logout();
          return;
        }

        const response = await fetch(`${API_URL}/v1/user/refresh_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: currentToken,
            account_id: payload.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
          
          // Update user data from new token
          const newPayload = JSON.parse(atob(data.token.split('.')[1]));
          setUser({
            id: newPayload.id,
            email: newPayload.email,
            username: newPayload.username || '', // Ensure username is set
            is_active: newPayload.is_active ?? false,
            is_verified: newPayload.is_verified ?? false,
            posted_count: newPayload.posted_count ?? 0,
            favorites_received: newPayload.favorites_received ?? 0,
            favorites_given: newPayload.favorites_given ?? 0,
            updated_at: newPayload.updated_at ?? new Date().toISOString()
          });
          
          setupTokenRefresh(); // Set up next refresh
        } else {
          console.error(`Failed to refresh token: ${response.statusText} - ${response.status}`);
          logout();
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        logout();
        return;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
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
            username: payload.username || '',
            is_active: payload.is_active,
            is_verified: payload.is_verified,
            posted_count: payload.posted_count,
            favorites_received: payload.favorites_received ?? 0,
            favorites_given: payload.favorites_given ?? 0,
            updated_at: payload.updated_at
          });
          setupTokenRefresh();
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, turnstileToken?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken })
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
        // @ts-ignore
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
          username: decodedPayload.username || '', // Ensure username is set
          is_active: decodedPayload.is_active ?? false,
          is_verified: decodedPayload.is_verified ?? false,
          posted_count: decodedPayload.posted_count ?? 0,
          favorites_received: decodedPayload.favorites_received ?? 0,
          favorites_given: decodedPayload.favorites_given ?? 0,
          updated_at: decodedPayload.updated_at ?? new Date().toISOString()
        });

        setupTokenRefresh();
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

  const getUserInfo = async () => {
    const response = await fetch(`${API_URL}/v1/member/get-user-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user?.id
      })
    });
    const data = await response.json();
    setUserInfo(data);
    return data;
  };

  // const get_posted = async () => {
  //   if (!user || !token) {
  //     throw new Error('User not authenticated');
  //   }
  //   const response = await fetch(`${API_URL}/v1/member/posts${next_token ? `?next_token=${next_token}` : ''}`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json'
  //     }
  //   });
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch posted data');
  //   }
  //   const data = await response.json();
  //   setNextToken(data.next_token || null);
  //   return data;
  // }

  
  const setUsername = async (username: string) => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/v1/user/change_username`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Failed to set username');
    }

    const data = await response.json();
    if (data.status === "success") {
      setUser(prev => {
        if (!prev) return prev; // Handle case where prev might be null
        return {
          ...prev,
          username: data.username || username // Use the returned username or fallback to the input
        };
      });
    }
  };

  const register = async (email: string, password: string, turnstileToken?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken })
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
    setUsername,
    getUserInfo,
    logout,
    getAuthHeader,
    token,
    userInfo,
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
        
        const data = await response.json();
        if (data.status === "failed") {
          throw new Error(data.message || 'Lỗi xác thực OTP');
        }

      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
