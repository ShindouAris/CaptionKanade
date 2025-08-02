import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Heart, Smile, Coffee, Star } from 'lucide-react';
import { useCaptions } from '../contexts/CaptionContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { captions } = useCaptions();
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const navigate = useNavigate();

  const sampleCaptions = [
    { text: "Tình yêu đến từ cái nhìn đầu tiên 💘", icon: Heart },
    { text: "Trà đá vỉa hè và em – đều là chân ái", icon: Coffee },
    { text: "Mood hôm nay: đi trốn với caption", icon: Smile },
    { text: "Chỉ cần em thích, caption này sẽ hợp", icon: Star },
    { text: "Yêu không cần lý do, caption thì cần", icon: Sparkles }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSampleIndex((prev) => (prev + 1) % sampleCaptions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
                Bắt đầu ngay
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/library')}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-600 text-gray-800 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg"
              >
                Xem thư viện
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-ping opacity-40"></div>
      </section>

      {/* Sample Captions Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              💡 Gợi ý caption hot trend
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Những caption được yêu thích nhất từ cộng đồng (T xao l day)
            </p>
          </div>

          <div className="relative h-32 mb-8">
            {sampleCaptions.map((sample, index) => {
              const Icon = sample.icon;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    index === currentSampleIndex
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-3xl p-8 shadow-lg border border-pink-200 dark:border-gray-600 max-w-2xl w-full">
                    <div className="flex items-center justify-center gap-4">
                      <Icon size={24} className="text-pink-600 dark:text-pink-400" />
                      <p className="text-xl font-medium text-gray-800 dark:text-white text-center">
                        "{sample.text}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-2">
            {sampleCaptions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSampleIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSampleIndex
                    ? 'bg-pink-500 dark:bg-pink-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
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

      {/* Stats Section */}
      {captions.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              Thống kê thư viện của bạn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {captions.length}
                </div>
                <div className="text-pink-100">Caption đã tạo</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {captions.filter(c => c.is_favorite).length}
                </div>
                <div className="text-pink-100">Caption yêu thích</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {Array.from(new Set(captions.flatMap(c => c.tags))).length}
                </div>
                <div className="text-pink-100">Tag đã sử dụng</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;