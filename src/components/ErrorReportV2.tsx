import React from "react";

export const ErrorReportV2: React.FC = () => {
    const formUrl = "https://forms.gle/GDPMobq3bZX3SJ7q8";

    return (
        <div className="max-w-[720px] mx-auto mt-6 p-5 font-sans">
            <h1 className="text-2xl font-semibold mb-3">Báo cáo lỗi</h1>

            <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                <p className="mb-4 text-sm">
                    Để gửi báo cáo lỗi hoặc phản hồi, vui lòng đi tới form thu thập bên ngoài.
                </p>

                <div className="flex items-center gap-3">
                    <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
                    >
                        Mở form báo cáo
                    </a>

                    <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(formUrl)}
                        className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                    >
                        Sao chép liên kết
                    </button>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                    Form sẽ mở trong tab mới. Nếu cần, bạn có thể sao chép liên kết và chia sẻ.
                </p>
            </div>
        </div>
    );
}
