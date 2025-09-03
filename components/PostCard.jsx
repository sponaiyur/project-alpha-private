"use client";

import React from "react";

const PostCard = ({ username, avatar, content, time }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex gap-4">
      {/* Avatar */}
      <img
        src={avatar}
        alt={username}
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* Post content */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{username}</h3>
          <span className="text-gray-500 text-sm">{time}</span>
        </div>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{content}</p>
      </div>
    </div>
  );
};

export default PostCard;
