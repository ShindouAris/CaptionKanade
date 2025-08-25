import React from 'react';
import { Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn. Hãy liên hệ với chúng tôi để được hỗ trợ tốt nhất.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Admin Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200 dark:border-gray-600">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <img src="/admin.jfif" alt="Admin" className="w-full h-full object-cover rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin</h2>
              <p className="text-gray-600 dark:text-gray-300">Arisdev</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 dark:bg-gray-700">
                <Mail className="text-pink-600 dark:text-pink-400" size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-300">kadintran010@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-gray-700">
                <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Thời gian làm việc</p>
                  <p className="text-gray-600 dark:text-gray-300">8:00 - 23:00 (GMT+7)</p>
                </div>
              </div>

              <div className="flex justify-center items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-gray-700">
                <a href="https://discord.com/users/867040792463802389" className="flex justify-center items-center w-full">
                  <img 
                    src="https://lanyard.cnrad.dev/api/867040792463802389?animated=false&bg=ffdcff&theme=light&showDisplayName=true&hideSpotify=true&idleMessage=%C4%90ang%20r%E1%BA%A3nh%20n%C3%A8%20%3AD" 
                    className="mx-auto"
                  />
                </a>
              </div>

            </div>
          </div>

          {/* Discord & Email Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200 dark:border-gray-600">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Kênh Liên Lạc Chính</h2>
              <p className="text-gray-600 dark:text-gray-300">Tham gia Discord hoặc gửi email để được hỗ trợ</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600">
                                 <div className="flex items-center gap-3 mb-3">
                   <MessageCircle className="text-green-600 dark:text-green-400" size={24} />
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discord Server</h3>
                 </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Tham gia server Discord của chúng tôi để:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4 mb-4">
                  <li>• Nhận hỗ trợ kỹ thuật trực tiếp</li>
                  <li>• Thảo luận về tính năng mới</li>
                  <li>• Báo cáo lỗi và đề xuất cải tiến</li>
                  <li>• Kết nối với cộng đồng người dùng</li>
                </ul>
                <a
                  href="https://discord.chisadin.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                                     <MessageCircle size={16} />
                   Tham gia Discord
                </a>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Hỗ Trợ</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  Gửi email trực tiếp cho chúng tôi:
                </p>
                <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                    kadintran010@gmail.com
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Thời gian phản hồi: Trong vòng 24 giờ làm việc
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200 dark:border-gray-600">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thông Tin Khác</h3>
            <p className="text-gray-600 dark:text-gray-300">Các thông tin khác của chúng tôi</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-gray-700">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-pink-600 dark:text-pink-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Địa chỉ</h4>
                <p className="text-gray-600 dark:text-gray-300">
                    Trên mạng
                </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-gray-700">
              <Clock className="w-12 h-12 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Giờ làm việc</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Thứ 2 - Thứ 6: 8:00 - 23:00<br />
                Thứ 7: 8:00 - 18:00<br />
                Chủ nhật: 10:00 - 18:00
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-gray-700">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Phản hồi</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Discord: Ngay lập tức<br />
                Email: Trong vòng 24 giờ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
