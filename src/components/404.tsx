import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number with Animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-600/20 blur-3xl rounded-full animate-ping"></div>
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Oops! Trang không tìm thấy
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Có vẻ như trang bạn đang tìm kiếm đã biến mất vào vũ trụ kỹ thuật số rồi. 
          Đừng lo lắng, hãy để chúng tôi đưa bạn về nhà an toàn!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Về Trang Chủ
            </Link>
          </Button>

          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <Link to="/library" className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Khám Phá Thư Viện
            </Link>
          </Button>
        </div>

        {/* Back Button */}
        <Button 
          asChild
          variant="ghost"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          onClick={() => window.history.back()}
        >
          <button className="flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Quay Lại Trang Trước
          </button>
        </Button>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4 opacity-30">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Bạn có thể thử những trang này:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              to="/builder" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Caption Studio
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              to="/trending" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Trending
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              to="/tutorial" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Hướng Dẫn
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              to="/contact" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Liên Hệ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
