import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Tạo, lưu trữ và chia sẻ
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                7749 caption
              </span>
              theo phong cách của bạn
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Công cụ tạo caption thông minh với khả năng tùy chỉnh không giới hạn. 
              Biến ảnh của bạn thành những câu chuyện đầy cảm xúc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/builder')}
                className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
              >
                Bắt đầu tạo caption ngay
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/library')}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-600 text-gray-800 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg"
              >
                Xem các caption đã được chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-ping opacity-40"></div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-pink-300 dark:border-green-600 p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Khảo sát ý kiến người dùng
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Hãy giúp chúng mình cải thiện CaptionKanade bằng cách tham gia khảo sát ngắn dưới đây nhé!
          </p>
          <a
            href="https://forms.gle/2qmjKA4XGYSXz5rz6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Tham gia khảo sát
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tính năng nổi bật
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Mọi thứ bạn cần để tạo ra những caption hoàn hảo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Tùy chỉnh không giới hạn",
                description: "Chọn font, màu sắc, background và emoji theo ý thích"
              },
              {
                icon: "📱",
                title: "Responsive hoàn hảo",
                description: "Hoạt động mượt mà trên mọi thiết bị từ mobile đến desktop"
              },
              {
                icon: "🏷️",
                title: "Quản lý thông minh",
                description: "Phân loại caption theo tag, tìm kiếm và lọc dễ dàng"
              },
              {
                icon: "💾",
                title: "Lưu trữ an toàn",
                description: "Dữ liệu được lưu trên đám mây, không lo mất caption"
              },
              {
                icon: "🌙",
                title: "Dark mode",
                description: "Giao diện tối nhẹ nhàng cho mắt trong môi trường yếu sáng"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;