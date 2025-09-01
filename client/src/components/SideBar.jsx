// components/Sidebar.jsx
import React from "react";

export default function Sidebar() {
  return (
    <div className="bg-gray-900 text-white w-64 h-screen p-5 flex flex-col gap-5">
      <h1 className="text-xl font-bold">Chyrp Lite</h1>
      <a href="#" className="hover:text-gray-300">Dashboard</a>
      <a href="#" className="hover:text-gray-300">Posts</a>
      <a href="#" className="hover:text-gray-300">Themes</a>
      <a href="#" className="hover:text-gray-300">Settings</a>
    </div>
  );
}
