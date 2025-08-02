import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Calendar, Hash, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { FaDev } from "react-icons/fa";
import { FiDollarSign } from "react-icons/fi";
import { FaCode } from "react-icons/fa6";
import { TbLockQuestion } from "react-icons/tb";

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
  created_at: string;
  updated_at: string;
}

const UserPage: React.FC = () => {
  const { user: authUser, getUserInfo } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const getLocalUserInfo = (): ExtendedUserInfo | null => {
    const token = localStorage.getItem('auth_token');
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
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
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
          created_at: localInfo?.created_at ?? new Date().toISOString(),
          updated_at: data.updated_at ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!authUser || !userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading user information...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="relative h-32">
            <img src='/banner.png' alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
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
                    Account Information
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your basic account details
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-pink-500" />
                    <span>{userInfo.email}</span>
                  </div>

                  {userInfo.username ? (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Hash className="w-5 h-5 text-pink-500" />
                      <span>{userInfo.username || 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Hash className="w-5 h-5 text-pink-500" />
                      <span>N/A</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Hash className="w-5 h-5 text-pink-500" />
                    <span className="font-mono text-sm">{userInfo.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <span>Joined: {formatDate(userInfo.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Account Status
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Current status and permissions
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
                      Usage Statistics
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Your activity on the platform
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 text-pink-500 hover:text-pink-600 disabled:text-gray-400 transition-colors"
                    title="Refresh statistics"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                    {userInfo.posted_count}
                  </div>
                  <div className="text-sm text-pink-600 dark:text-pink-400">
                    Captions Posted
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Subscription Details
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your current plan information
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiDollarSign className="w-5 h-5 text-pink-500" />
                    <span>
                      Plan: {userInfo.plan_name || 'Free Plan'}
                    </span>
                  </div>

                  {userInfo.expired_at && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-5 h-5 text-pink-500" />
                      <span>
                        Expires: {formatDate(userInfo.expired_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
