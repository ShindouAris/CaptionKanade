const API_URL = import.meta.env.VITE_API_URL;

export interface GoogleAuthResponse {
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    ttl: number;
    user?: {
      id: string;
      email: string;
      username: string;
      is_active: boolean;
      is_verified: boolean;
    };
  };
  message?: string;
}

export class GoogleAuthService {
  static async authenticateWithGoogle(accessToken: string): Promise<GoogleAuthResponse> {
    const response = await fetch(`${API_URL}/v1/user/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Xử lý các lỗi cụ thể từ server
      if (response.status === 401) {
        throw new Error('account_not_found');
      } else if (response.status === 400) {
        throw new Error('invalid_token');
      } else if (response.status >= 500) {
        throw new Error('server_error');
      } else {
        throw new Error(data.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google');
      }
    }

    return data;
  }

  static async validateGoogleToken(accessToken: string): Promise<boolean> {
    try {
      // Gọi Google API để validate token
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      return response.ok;
    } catch (error) {
      console.error('Google token validation failed:', error);
      return false;
    }
  }
}
