import React from 'react';
import { Button } from '../ui/button';
import { FaGoogle } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={`w-full transition-all duration-200 hover:shadow-md ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <FaGoogle className="w-4 h-4 mr-2 text-red-500" />
      )}
      <span>
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
      </span>
    </Button>
  );
};


