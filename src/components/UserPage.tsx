import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Calendar, Hash, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { FaDev } from "react-icons/fa";
import { FiDollarSign } from "react-icons/fi";
import { FaCode, FaThreads } from "react-icons/fa6";
import { TbLockQuestion } from "react-icons/tb";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import toast from 'react-hot-toast';
import UserUploaded from './UserComponents/Posted';
import UserFavorited from './UserComponents/Favorited';
import { UserTabs } from './UserComponents/TabSelections';

interface ExtendedUserInfo {
  email: string;
  id: string;
  username: string; // Optional, in case username is not always present
  is_active: boolean;
  is_verified: boolean;
  developer_access: boolean;
  plan_name: string | null;
  expired_at: string | null;
  posted_count: number;
  favorites_given: number;
  favorites_received: number;
  created_at: string;
  updated_at: string;
}

const Change_UserName: React.FC = () => {
  const AuthContext = useAuth();
  const [username, setUsername] = useState(AuthContext.user?.username || '');
  const [open, setOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      alert('Tên người dùng không được để trống');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      alert('Tên người dùng phải từ 3 đến 20 ký tự');
      return;
    }
    AuthContext.setUsername(username)
      .then(() => {
        toast.success('Tên người dùng đã được cập nhật thành công, bạn có thể cân nhắc đăng xuất và đăng nhập lại để cập nhật tên người dùng mới');
        setOpen(false);
      })
      .catch((error) => {
        console.error('Error updating username:', error);
        toast.error('Đã xảy ra lỗi khi cập nhật tên người dùng');
      });

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant={'outline'} className='ping-600'>Đổi tên người dùng</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên người dùng</DialogTitle>
            <DialogDescription>
              Nhập tên người dùng mới của bạn. Tên người dùng sẽ được sử dụng để hiển thị trên các caption và hoạt động của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Label htmlFor="username">Tên người dùng</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên người dùng mới"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>Lưu</Button>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );

}

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    isVisible && (
      <span
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 h-15 py-5 px-5 rounded-3xl bg-primary text-white shadow-lg hover:bg-primary/90 transition z-[9999]"
      >
        <div>
        ↑
        </div>
      </span>
    )
  );
}

const UserPage: React.FC = () => {
  const { user: authUser, getUserInfo } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, settab] = useState("posted")

  const getLocalUserInfo = (): ExtendedUserInfo | null => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email,
        id: payload.id,
        is_active: payload.is_active,
        is_verified: payload.is_verified,
        developer_access: payload.developer_access ?? false,
        plan_name: payload.plan_name ?? null,
        username: payload.username ?? '', // Ensure username is set
        expired_at: payload.expired_at ?? null,
        posted_count: payload.posted_count ?? 0,
        favorites_given: payload.favorites_given ?? 0,
        favorites_received: payload.favorites_received ?? 0,
        created_at: payload.created_at ?? new Date().toISOString(),
        updated_at: payload.updated_at ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  };

  const [userInfo, setUserInfo] = useState<ExtendedUserInfo | null>(getLocalUserInfo());

  // Fetch user info on mount
  useEffect(() => {
    if (authUser && authUser.id) {
      handleRefresh();
    }
  }, [authUser?.id]); // Only run when user ID changes

  const handleRefresh = useCallback(async () => {
    if (!authUser?.id) return;
    
    setIsRefreshing(true);
    try {
      const data = await getUserInfo();
      if (data) {
        const localInfo = getLocalUserInfo();
        setUserInfo({
          email: localInfo?.email ?? '',
          id: localInfo?.id ?? '',
          username: localInfo?.username ?? '', // Ensure username is set
          is_active: localInfo?.is_active ?? false,
          is_verified: localInfo?.is_verified ?? false,
          developer_access: localInfo?.developer_access ?? false,
          plan_name: localInfo?.plan_name ?? null,
          expired_at: localInfo?.expired_at ?? null,
          posted_count: data.posted_count ?? 0,
          favorites_given: data.favorites_given ?? 0,
          favorites_received: data.favorites_received ?? 0,
          created_at: localInfo?.created_at ?? new Date().toISOString(),
          updated_at: data.updated_at ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [authUser?.id, getUserInfo]);

  if (!authUser || !userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading user information...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-50 dark:from-gray-900 dark:via-accent/10 dark:to-indigo-900 py-12 px-4">
      <ScrollToTopButton />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="relative h-32">
            <img src='/banners/banner.jpg' alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <img src="/avatar.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="pt-16 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Thông tin tài khoản
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Thông tin cơ bản về tài khoản của bạn
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{userInfo.email}</span>
                  </div>

                  {userInfo.username ? (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FaThreads className="w-5 h-5 text-primary" />
                      <span>{userInfo.username || 'N/A'}</span>
                      <Change_UserName />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FaThreads className="w-5 h-5 text-primary" />
                      Chưa có tên người dùng
                      <Change_UserName />
                    </div>
                  )}
                  

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Hash className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm">{userInfo.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Tham gia {formatDate(userInfo.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tình trạng tài khoản
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Tình trạng hiện tại và quyền hạn của bạn
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {userInfo.is_active ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      Tài khoản {userInfo.is_active ? 'đang hoạt động' : 'vô hiệu hóa'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {userInfo.is_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      Email {userInfo.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {userInfo.developer_access ? (
                      <FaDev className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <FaDev className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      Developer Access: {userInfo.developer_access ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {userInfo.developer_access ? (<FaCode className=' w-5 h-5 text-blue-500'/>) : (<TbLockQuestion className='w-5 h-5 text-gray-400'/>)}
                    {userInfo.developer_access ? (
                      <a
                        href={`https://devconsole.captionkanade.chisadin.site`}
                        className="text-sm text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Truy cập Dev Console
                      </a> 
                       ) :
                      (<a href={`https://discord.chisadin.site`} className="text-sm text-blue-500">Xin quyền truy cập console</a>)
                    }
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Thống kê sử dụng
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Hoạt động của bạn trên nền tảng
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 text-primary hover:text-primary/90 disabled:text-gray-400 transition-colors"
                    title="Refresh statistics"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="p-4 bg-primary/5 dark:bg-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {userInfo.posted_count}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Captions đã đăng (bao gồm đã xóa rồi)
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {userInfo.favorites_given}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    Captions yêu thích
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-4xl font-bold text-primary dark:text-primary">
                    {userInfo.favorites_received}
                  </div>
                  <div className="text-sm text-primary dark:text-primary">
                    Số yêu thích nhận được
                  </div>
                  </div>
                </div>    
              </div>

              {/* Subscription Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Thông tin đăng ký
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Thông tin về gói hiện tại của bạn
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiDollarSign className="w-5 h-5 text-primary" />
                    <span>
                      Plan: {userInfo.plan_name || 'Dev lười quá chưa làm :('}
                    </span>
                  </div>

                  {userInfo.expired_at && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>
                        Expires: hôm nay 💀💀
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Uploaded && Favorited */}
        <div className='mt-2'>
        <UserTabs 
          tab={tab}
          setTab={settab}
          />
        {
          tab === "posted" ? (<UserUploaded />) : (<UserFavorited />)
        }
        
        </div>
      </div>
    </div>
  );
};

export default UserPage;
