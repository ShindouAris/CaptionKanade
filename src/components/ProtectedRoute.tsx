import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireVerified = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Có thể thêm loading spinner ở đây
    return <div>Loading...</div>;
  }

  if (!user) {
    // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (requireVerified && !user.is_verified) {
    // Chuyển hướng đến trang xác thực email nếu tài khoản chưa được xác thực
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 