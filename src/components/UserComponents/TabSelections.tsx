import React from "react";

interface Tabs {
    tab: string,
    setTab: (tab: string) => void
}

export const UserTabs: React.FC<Tabs> = ({ tab, setTab }) => {
  return (
    <div className="flex mb-4 justify-center">
      <div className="inline-flex rounded-full overflow-hidden border border-gray-300">
        <button
          onClick={() => setTab("posted")}
          className={`px-4 py-2 font-semibold text-sm duration-200 ${
            tab === "posted"
              ? "bg-gradient-to-r to-pink-200 via-sky-300 from-yellow-200 text-black"
              : "bg-white text-gray-700"
          }`}
        >
          Bài đăng
        </button>
        <button
          onClick={() => setTab("favorite")}
          className={`px-4 py-2 font-semibold text-sm duration-200 ${
            tab === "favorite"
              ? "bg-gradient-to-r from-pink-200 via-sky-300 to-yellow-200 text-black"
              : "bg-white text-gray-700"
          }`}
        >
          Đã yêu thích
        </button>
      </div>
    </div>
  );
}
