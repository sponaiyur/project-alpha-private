// components/PostCard.jsx
import React from "react";

export default function PostCard({ title, excerpt }) {
  return (
    <div className="bg-gray-800 p-5 rounded-lg text-white hover:bg-gray-700 transition cursor-pointer">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-gray-300">{excerpt}</p>
    </div>
  );
}
