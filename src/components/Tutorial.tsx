import React from 'react';
import { Link } from 'react-router-dom';

const mockSteps = [
  {
    id: 1,
    title: 'Làm quen với UI CaptionKanade',
    description: 'Tìm hiểu các phần chính của UI CaptionKanade.',
  },
  {
    id: 2,
    title: 'Cách lấy ID bài viết',
    description: 'Cách lấy ID bài viết để tạo caption.',
  }
];

const Tutorial: React.FC = () => {
  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-red-300 to-blue-300 bg-clip-text text-transparent">
            Hướng dẫn nhanh
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trang hướng dẫn để bạn làm quen với CaptionKanade.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Các bước cơ bản
            </h2>
            <ol className="space-y-3">
              {mockSteps.map((step) => (
                <li
                  key={step.id}
                  className="flex gap-4 items-start bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-primary/10 dark:border-gray-700"
                >
                  <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center font-bold">
                    {step.id}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Mẹo nhanh
            </h2>
            <img src="/haysuynghinhumotkisu.png" alt="idk" className='w-full h-auto rounded-lg' />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Làm quen với UI CaptionKanade
          </h2>
          <img src="/Tut1.png" alt="UI CaptionKanade" className='w-full h-auto rounded-lg' />
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Cách lấy ID bài viết
          </h2>
          <img src="/Tut2.png" alt="ID bài viết" className='w-full h-auto rounded-lg' />
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Các phần tử của trang Caption Studio
          </h2>
          <img src="/Tut3.png" alt="Tạo caption" className='w-full h-auto rounded-lg' />
        </section>

        <section>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            Collaboration - Locket DIO
          </h2>
          <video
            controls
            width="100%"
            className="rounded-lg border border-primary/20 dark:border-gray-700 shadow"
          >
            <source src="https://cdn.chisadin.site/locketdio.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        </section>

        <footer className="text-center text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">Bạn có thể bắt đầu tạo caption thật tại phần "Caption Studio".</p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <Link 
              to="/" 
              className="hover:text-primary dark:hover:text-primary transition-colors"
            >
              Trang chủ
            </Link>
            <span>•</span>
            <Link 
              to="/contact" 
              className="hover:text-primary dark:hover:text-primary transition-colors"
            >
              Liên hệ
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Tutorial;


