import React from 'react';
// import { Link } from 'react-router-dom';
import {  AlertTriangle } from 'lucide-react';


const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* Shutdown Date Banner */}
                <div className="mb-6 p-3 rounded-xl bg-red-200/60 dark:bg-red-900/40 border border-red-400/40">
                    <p className="text-red-700 dark:text-red-300 font-semibold text-lg">
                        Dịch vụ đã ngưng hoạt động từ ngày <span className="font-bold">25/11/2025</span> ❌
                    </p>
                </div>

                {/* 410 Gone */}
                <div className="relative mb-8">
                    <h1 className="text-8xl md:text-[10rem] font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                        410
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 blur-3xl rounded-full animate-ping"></div>
                </div>

                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Trang đã ngưng hoạt động
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Trang này hiện tại không còn khả dụng nữa.
                </p>

                {/* Action Buttons */}
                {/*<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">*/}
                {/*    <Button*/}
                {/*        asChild*/}
                {/*        size="lg"*/}
                {/*        className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"*/}
                {/*    >*/}
                {/*        <Link to="/" className="flex items-center gap-2">*/}
                {/*            <Home className="w-5 h-5" />*/}
                {/*            Về Trang Chủ*/}
                {/*        </Link>*/}
                {/*    </Button>*/}

                {/*    <Button*/}
                {/*        asChild*/}
                {/*        variant="outline"*/}
                {/*        size="lg"*/}
                {/*        className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"*/}
                {/*    >*/}
                {/*        <Link to="/library" className="flex items-center gap-2">*/}
                {/*            <Search className="w-5 h-5" />*/}
                {/*            Khám Phá Thư Viện*/}
                {/*        </Link>*/}
                {/*    </Button>*/}
                {/*</div>*/}

                {/* Back Button */}
                {/*<Button*/}
                {/*    asChild*/}
                {/*    variant="ghost"*/}
                {/*    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"*/}
                {/*    onClick={() => window.history.back()}*/}
                {/*>*/}
                {/*    <button className="flex items-center gap-2 mx-auto">*/}
                {/*        <ArrowLeft className="w-4 h-4" />*/}
                {/*        Quay Lại Trang Trước*/}
                {/*    </button>*/}
                {/*</Button>*/}

                {/* Decorative Dots */}
                <div className="mt-12 flex justify-center space-x-4 opacity-30">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
