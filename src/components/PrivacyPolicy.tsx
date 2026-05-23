import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-50 dark:from-gray-900 dark:via-accent/10 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chính Sách Bảo Mật
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang chủ
            </Link>
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              Giới Thiệu
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              CaptionKanade ("chúng tôi", "của chúng tôi", hoặc "ứng dụng") cam kết bảo vệ quyền riêng tư của bạn. 
              Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn 
              khi bạn sử dụng ứng dụng CaptionKanade.
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-primary" />
              Thông Tin Chúng Tôi Thu Thập
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Thông tin cá nhân:</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Địa chỉ email</li>
                  <li>Tên người dùng</li>
                  <li>Thông tin đăng nhập Google (nếu sử dụng đăng nhập Google)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Thông tin sử dụng:</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                  <li>Caption bạn tạo và lưu trữ</li>
                  <li>Thời gian sử dụng ứng dụng</li>
                  <li>Tương tác với các tính năng</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-primary" />
              Cách Chúng Tôi Sử Dụng Thông Tin
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Chúng tôi sử dụng thông tin thu thập để:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>Cung cấp và duy trì dịch vụ CaptionKanade</li>
              <li>Xử lý và lưu trữ caption của bạn</li>
              <li>Cải thiện trải nghiệm người dùng</li>
              <li>Gửi thông báo quan trọng về dịch vụ</li>
              <li>Đảm bảo an toàn và bảo mật</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Chia Sẻ Thông Tin
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba 
              mà không có sự đồng ý của bạn, trừ khi được yêu cầu bởi pháp luật hoặc để bảo vệ quyền lợi của chúng tôi.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-primary" />
              Bảo Mật Dữ Liệu
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi thực hiện các biện pháp bảo mật phù hợp để bảo vệ thông tin cá nhân của bạn 
              khỏi truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy. Tuy nhiên, không có phương pháp 
              truyền tải qua internet hoặc phương pháp lưu trữ điện tử nào là 100% an toàn.
            </p>
          </section>

          {/* Third-party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Dịch Vụ Bên Thứ Ba</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ứng dụng của chúng tôi có thể chứa liên kết đến các trang web bên thứ ba. Chúng tôi không 
              chịu trách nhiệm về nội dung hoặc chính sách bảo mật của các trang web này.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Quyền Riêng Tư Trẻ Em</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              CaptionKanade không nhắm đến trẻ em dưới 13 tuổi. Chúng tôi không thu thập có chủ ý 
              thông tin cá nhân từ trẻ em dưới 13 tuổi.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Thay Đổi Chính Sách</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo 
              về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Thông Tin Liên Hệ</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với tôi tại:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-200">
                <strong>Email:</strong> kadintran010@gmail.com<br />
                <strong>Địa chỉ:</strong> CaptionKanade Team<br />
                <strong>Thời gian phản hồi:</strong> Trong vòng 48 giờ
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <Link 
                  to="/" 
                  className="hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Trang chủ
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link 
                  to="/contact" 
                  className="hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </div>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} CaptionKanade. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
