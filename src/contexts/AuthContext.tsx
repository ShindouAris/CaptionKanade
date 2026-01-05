import { LogOutIcon } from 'lucide-react';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { GoogleAuthService } from '../services/googleAuthService';

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
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
  accessToken: string | null;
  refreshToken: string | null;
  get_posted: () => Promise<void>;
  verifyAccount: (token: string) => Promise<void>;
  submitOtp: (token: string, otp: string) => Promise<void>;
  getUserInfo: () => Promise<User | null>;
  googleauth: (token: string) => Promise<void>
  userInfo: User | null;
}

// Token utility functions
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  static removeTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove tokens:', error);
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [next_token, setNextToken] = useState<string | null>(null);

  // Use refs to track refresh state and prevent multiple concurrent refreshes
  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  
  // Use refs to avoid dependency loops
  const userRef = useRef<User | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  // Update refs when state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

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
    setAccessToken(null);
    setRefreshToken(null);
    TokenManager.removeTokens();
    clearRefreshTimeout();
    isRefreshingRef.current = false;
    refreshPromiseRef.current = null;
  }, [clearRefreshTimeout]);

  // Update user state from access token
  const updateUserFromToken = useCallback((newAccessToken: string) => {
    const payload = TokenManager.parseTokenPayload(newAccessToken);
    const newUser = TokenManager.createUserFromPayload(payload);
    
    if (newUser) {
      setUser(newUser);
      setAccessToken(newAccessToken);
      return true;
    }
    return false;
  }, []);

  // Refresh token function
  const refreshAccessToken = useCallback(async (): Promise<void> => {
    // Prevent multiple concurrent refresh attempts
    if (isRefreshingRef.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    isRefreshingRef.current = true;
    
    const refreshPromise = (async () => {
      try {
        const currentRefreshToken = TokenManager.getRefreshToken();
        
        if (!currentRefreshToken) {
          throw new Error('No refresh token found');
        }

        const response = await fetch(`${API_URL}/v1/user/refresh_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refresh_token: currentRefreshToken
          })
        });

        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.access_token) {
          throw new Error('No access token in refresh response');
        }

        // Update tokens
        setAccessToken(data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
          TokenManager.setTokens(data.access_token, data.refresh_token);
        } else {
          TokenManager.setTokens(data.access_token, currentRefreshToken);
        }

        // Update user state if needed - use ref to avoid dependency
        if (!userRef.current) {
          updateUserFromToken(data.access_token);
        }

        // Schedule next refresh
        scheduleTokenRefresh(data.access_token);
        
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
    const targetToken = tokenToCheck || TokenManager.getAccessToken();
    
    if (!targetToken || TokenManager.isTokenExpired(targetToken)) {
      // Try to refresh if we have a refresh token
      if (TokenManager.getRefreshToken()) {
        refreshAccessToken().catch(() => {
          // Error handling is done in refreshAccessToken
        });
        return;
      }
      clearAuthState();
      return;
    }

    if (TokenManager.shouldRefreshToken(targetToken)) {
      // Token needs immediate refresh
      refreshAccessToken().catch(() => {
        // Error handling is done in refreshAccessToken
      });
      return;
    }

    // Schedule future refresh
    clearRefreshTimeout();
    const expTime = TokenManager.getTokenExpiration(targetToken);
    const timeUntilRefresh = expTime - Date.now() - TokenManager['REFRESH_BUFFER_MS'];

    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshAccessToken().catch(() => {
          // Error handling is done in refreshAccessToken
        });
      }, timeUntilRefresh);
    }
  }, [refreshAccessToken, clearAuthState, clearRefreshTimeout]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const savedAccessToken = TokenManager.getAccessToken();
      const savedRefreshToken = TokenManager.getRefreshToken();
      
      if (savedAccessToken && !TokenManager.isTokenExpired(savedAccessToken)) {
        const success = updateUserFromToken(savedAccessToken);
        if (success) {
          setAccessToken(savedAccessToken);
          setRefreshToken(savedRefreshToken);
          scheduleTokenRefresh(savedAccessToken);
        } else {
          toast.error("Làm mới session thất bại, vui lòng đăng nhập lại")
          clearAuthState();
        }
      } else if (savedRefreshToken && savedAccessToken) {
        // Access token expired but refresh token exists, try to refresh
        refreshAccessToken().catch(() => {
          toast.error("Phiên đã hết hạn, vui lòng đăng nhập lại", {
            icon: <LogOutIcon />,
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#fff1f2",
              color: "#b91c1c",
              fontWeight: 500,
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          });
          clearAuthState();
        });
      } else if (savedAccessToken) {
        // Only access token exists but is expired, no refresh token
        toast.error("Phiên đã hết hạn, vui lòng đăng nhập lại", {
          icon: <LogOutIcon />,
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#fff1f2",
            color: "#b91c1c",
            fontWeight: 500,
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        });
        TokenManager.removeTokens();
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshTimeout();
    };
  }, [updateUserFromToken, scheduleTokenRefresh, clearAuthState, clearRefreshTimeout, refreshAccessToken]);

  // Login function
  const login = useCallback(async (email: string, password: string, turnstileToken?: string) => {
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
        if (data.error === "login_method_not_allowed") {
          throw new Error('Không thể đăng nhập bằng mật khẩu, hãy sử dụng nút đăng nhập bằng google');
        }
        throw new Error(data.detail || 'Đăng nhập thất bại');
      }

      if (!data.data?.access_token || !data.data?.refresh_token) {
        throw new Error('Không nhận được token từ server');
      }

      const success = updateUserFromToken(data.data.access_token);
      if (!success) {
        throw new Error('Token không hợp lệ');
      }

      // Store both tokens
      setRefreshToken(data.data.refresh_token);
      TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
      scheduleTokenRefresh(data.data.access_token);
      
    } catch (error) {
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateUserFromToken, scheduleTokenRefresh, clearAuthState]);

  const googleauth = useCallback(async (accesstoken: string) => {
    setLoading(true);
    try {
      // Validate Google token trước khi gửi lên server
      const isValidToken = await GoogleAuthService.validateGoogleToken(accesstoken);
      if (!isValidToken) {
        throw new Error('invalid_token');
      }

      const response = await GoogleAuthService.authenticateWithGoogle(accesstoken);
      
      if (!response.data?.access_token || !response.data?.refresh_token) {
        throw new Error('Không nhận được token từ server');
      }

      const success = updateUserFromToken(response.data.access_token);
      if (!success) {
        throw new Error('Token trả về từ server không hợp lệ');
      }

      // Store both tokens
      setRefreshToken(response.data.refresh_token);
      TokenManager.setTokens(response.data.access_token, response.data.refresh_token);
      scheduleTokenRefresh(response.data.access_token);

    } catch (error) {
      // Re-throw error để component có thể xử lý
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateUserFromToken, scheduleTokenRefresh]);

  const register = useCallback(async (email: string, password: string, turnstileToken?: string) => {
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
  }, [login]);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const getUserInfo = useCallback(async () => {
    if (!accessToken || !user?.id) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/v1/member/get-user-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id
      })
    });
    const data = await response.json();
    setUserInfo(data);
    return data;
  }, [accessToken, user?.id]);

  const get_posted = useCallback(async () => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(`${API_URL}/v1/member/posts${next_token ? `?next_token=${next_token}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch posted data');
    }
    const data = await response.json();
    setNextToken(data.next_token || null);
    return data;
  }, [user, accessToken, next_token]);

  const setUsername = useCallback(async (username: string) => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/v1/member/change_username`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
  }, [user, accessToken]);

  const getAuthHeader = useCallback(() => {
    return accessToken ? { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    } : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }, [accessToken]);

  const verifyAccount = useCallback(async (token: string) => {
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
  }, []);

  const submitOtp = useCallback(async (token: string, otp: string) => {
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
  }, []);

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
    accessToken,
    refreshToken,
    userInfo,
    verifyAccount,
    submitOtp,
    googleauth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;