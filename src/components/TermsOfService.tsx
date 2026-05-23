import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, AlertTriangle, CheckCircle, XCircle, FileText, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-50 dark:from-gray-900 dark:via-accent/10 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Điều Khoản Dịch Vụ
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
              Bằng việc sử dụng ứng dụng CaptionKanade ("Dịch vụ"), bạn đồng ý tuân thủ và bị ràng buộc 
              bởi những điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của những 
              điều khoản này, bạn không được phép sử dụng Dịch vụ.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              Chấp Nhận Điều Khoản
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Khi bạn truy cập hoặc sử dụng Dịch vụ, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ 
              những điều khoản này. Chúng tôi có quyền thay đổi những điều khoản này bất cứ lúc nào.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Mô Tả Dịch Vụ</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              CaptionKanade là một ứng dụng web cho phép người dùng:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>Tạo và chỉnh sửa caption</li>
              <li>Lưu trữ và quản lý caption</li>
              <li>Chia sẻ caption với cộng đồng</li>
              <li>Truy cập thư viện caption</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Tài Khoản Người Dùng
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Để sử dụng một số tính năng của Dịch vụ, bạn có thể cần tạo tài khoản. Bạn có trách nhiệm:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                <li>Bảo mật thông tin đăng nhập của bạn</li>
                <li>Không chia sẻ tài khoản với người khác</li>
                <li>Thông báo ngay lập tức nếu phát hiện vi phạm bảo mật</li>
                <li>Cung cấp thông tin chính xác và cập nhật</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              Sử Dụng Hợp Lệ
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Bạn đồng ý sử dụng Dịch vụ chỉ cho các mục đích hợp pháp và phù hợp. Bạn không được:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>Vi phạm bất kỳ luật pháp hoặc quy định nào</li>
              <li>Đăng nội dung phản cảm, bạo lực hoặc không phù hợp</li>
              <li>Quấy rối, đe dọa hoặc làm hại người khác</li>
              <li>Phá hoại hoặc can thiệp vào hoạt động của Dịch vụ</li>
            </ul>
          </section>

          {/* Content Guidelines */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Hướng Dẫn Nội Dung</h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Khi sử dụng Dịch vụ, bạn phải tuân thủ các hướng dẫn sau:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Được Phép
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Nội dung gốc và sáng tạo</li>
                    <li>• Caption phù hợp với thuần phong mỹ tục</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Không Được Phép
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Nội dung bạo lực hoặc phản cảm</li>
                    <li>• Quảng cáo spam hoặc lừa đảo</li>
                    <li>• Thông tin cá nhân của người khác</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Sở Hữu Trí Tuệ</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Dịch vụ và nội dung gốc của nó (bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, 
              và phần mềm) được bảo vệ bởi luật bản quyền và các quyền sở hữu trí tuệ khác. Bạn giữ 
              quyền sở hữu đối với nội dung bạn tạo ra, nhưng cấp cho chúng tôi quyền sử dụng để cung cấp Dịch vụ.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Quyền Riêng Tư</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Việc sử dụng Dịch vụ của bạn cũng tuân theo Chính sách Bảo mật của chúng tôi. 
              Vui lòng xem <Link to="/privacy" className="text-primary hover:text-primary/90 underline">Chính sách Bảo mật</Link> để hiểu cách chúng tôi thu thập và sử dụng thông tin.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Chấm Dứt Dịch Vụ</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi có thể chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào Dịch vụ bất cứ lúc nào, 
              vì bất kỳ lý do gì, bao gồm vi phạm những điều khoản này. Bạn cũng có thể chấm dứt việc sử dụng 
              Dịch vụ bất cứ lúc nào.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
              Tuyên Bố Miễn Trừ
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Dịch vụ được cung cấp "nguyên trạng" và "có sẵn". Chúng tôi không đảm bảo rằng Dịch vụ sẽ 
              không bị gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại 
              nào phát sinh từ việc sử dụng Dịch vụ.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Giới Hạn Trách Nhiệm</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Trong mọi trường hợp, CaptionKanade sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, 
              ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc sử dụng Dịch vụ.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Luật Áp Dụng</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Những điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp Việt Nam. 
              Bất kỳ tranh chấp nào phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Thay Đổi Điều Khoản</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi có quyền thay đổi những điều khoản này bất cứ lúc nào. Những thay đổi sẽ có hiệu lực 
              ngay khi được đăng trên trang này. Việc tiếp tục sử dụng Dịch vụ sau khi thay đổi có nghĩa là 
              bạn chấp nhận những điều khoản mới.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Thông Tin Liên Hệ</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về những điều khoản này, vui lòng liên hệ với chúng tôi:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-200">
                <strong>Email:</strong> kadintran010@gmail.com<br />
                <strong>Địa chỉ:</strong> CaptionKanade Team<br />
                <strong>Thời gian phản hồi:</strong> Trong vòng 72 giờ
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

export default TermsOfService;
