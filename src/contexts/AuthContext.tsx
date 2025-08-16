import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  get_posted: () => Promise<void>;
  verifyAccount: (token: string) => Promise<void>;
  submitOtp: (token: string, otp: number) => Promise<void>;
  getUserInfo: () => Promise<User | null>;
  userInfo: User | null;
}

// Token utility functions
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  static parseTokenPayload(token: string | null): any {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }

  static getTokenExpiration(token: string | null): number {
    const payload = this.parseTokenPayload(token);
    return payload?.exp ? payload.exp * 1000 : 0;
  }

  static isTokenExpired(token: string | null): boolean {
    const expTime = this.getTokenExpiration(token);
    return expTime <= Date.now();
  }

  static shouldRefreshToken(token: string | null): boolean {
    const expTime = this.getTokenExpiration(token);
    return expTime <= Date.now() + this.REFRESH_BUFFER_MS;
  }

  static createUserFromPayload(payload: any): User | null {
    if (!payload?.id || !payload?.email) return null;

    return {
      id: payload.id,
      email: payload.email,
      username: payload.username || '',
      is_active: payload.is_active ?? false,
      is_verified: payload.is_verified ?? false,
      posted_count: payload.posted_count ?? 0,
      favorites_received: payload.favorites_received ?? 0,
      favorites_given: payload.favorites_given ?? 0,
      updated_at: payload.updated_at ?? new Date().toISOString()
    };
  }
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
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [next_token, setNextToken] = useState<string | null>(null);

  // Use refs to track refresh state and prevent multiple concurrent refreshes
  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  // Clear refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Handle authentication state cleanup
  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    setUserInfo(null);
    TokenManager.removeToken();
    clearRefreshTimeout();
    isRefreshingRef.current = false;
    refreshPromiseRef.current = null;
  }, [clearRefreshTimeout]);

  // Update user state from token
  const updateUserFromToken = useCallback((newToken: string) => {
    const payload = TokenManager.parseTokenPayload(newToken);
    const newUser = TokenManager.createUserFromPayload(payload);
    
    if (newUser) {
      setUser(newUser);
      setToken(newToken);
      TokenManager.setToken(newToken);
      return true;
    }
    return false;
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    // Prevent multiple concurrent refresh attempts
    if (isRefreshingRef.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    isRefreshingRef.current = true;
    
    const refreshPromise = (async () => {
      try {
        const currentToken = TokenManager.getToken();
        
        if (!currentToken) {
          throw new Error('No token found');
        }

        const payload = TokenManager.parseTokenPayload(currentToken);
        if (!payload?.id) {
          throw new Error('Invalid token payload');
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

        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.token) {
          throw new Error('No token in refresh response');
        }

        // Update auth state with new token
        const success = updateUserFromToken(data.token);
        if (!success) {
          throw new Error('Failed to update user from refreshed token');
        }

        // Schedule next refresh
        scheduleTokenRefresh(data.token);
        
      } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthState();
        throw error;
      } finally {
        isRefreshingRef.current = false;
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [updateUserFromToken, clearAuthState]);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((tokenToCheck: string | null = null) => {
    const targetToken = tokenToCheck || TokenManager.getToken();
    
    if (!targetToken || TokenManager.isTokenExpired(targetToken)) {
      clearAuthState();
      return;
    }

    if (TokenManager.shouldRefreshToken(targetToken)) {
      // Token needs immediate refresh
      refreshToken().catch(() => {
        // Error handling is done in refreshToken
      });
      return;
    }

    // Schedule future refresh
    clearRefreshTimeout();
    const expTime = TokenManager.getTokenExpiration(targetToken);
    const timeUntilRefresh = expTime - Date.now() - TokenManager['REFRESH_BUFFER_MS'];

    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshToken().catch(() => {
          // Error handling is done in refreshToken
        });
      }, timeUntilRefresh);
    }
  }, [refreshToken, clearAuthState, clearRefreshTimeout]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = TokenManager.getToken();
      // const token_payload = TokenManager.parseTokenPayload(savedToken);
      // const current_time = new Date();
      // const expired_at = new Date(token_payload.exp * 1000);
      // console.log(`Token expired at: ${expired_at}`)
      // console.log(`Current time: ${current_time}`)
      // console.log(`Time until refresh: ${Math.floor((expired_at.getTime() - current_time.getTime()) / 1000)}s`)
      if (savedToken && !TokenManager.isTokenExpired(savedToken)) {
        const success = updateUserFromToken(savedToken);
        if (success) {
          scheduleTokenRefresh(savedToken);
        } else {
          clearAuthState();
        }
      } else if (savedToken) {
        // Token exists but is expired
        TokenManager.removeToken();
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshTimeout();
    };
  }, [updateUserFromToken, scheduleTokenRefresh, clearAuthState, clearRefreshTimeout]);

  // Login function
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

      if (!data.data?.token) {
        throw new Error('Không nhận được token từ server');
      }

      const success = updateUserFromToken(data.data.token);
      if (!success) {
        throw new Error('Token không hợp lệ');
      }

      scheduleTokenRefresh(data.data.token);
      
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
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
    clearAuthState();
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

  const get_posted = async () => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(`${API_URL}/v1/member/posts${next_token ? `?next_token=${next_token}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch posted data');
    }
    const data = await response.json();
    setNextToken(data.next_token || null);
    return data;
  };

  const setUsername = async (username: string) => {
    if (!user || !token) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/v1/member/change_username`, {
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
        if (!prev) return prev;
        return {
          ...prev,
          username: data.username || username
        };
      });
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

  const verifyAccount = async (token: string) => {
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
  };

  const submitOtp = async (token: string, otp: number) => {
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
  };

  const value = {
    user,
    loading,
    login,
    register,
    setUsername,
    getUserInfo,
    logout,
    get_posted,
    getAuthHeader,
    token,
    userInfo,
    verifyAccount,
    submitOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;