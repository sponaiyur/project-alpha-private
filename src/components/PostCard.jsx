"use client";

import React from "react";

const PostCard = ({ username, avatar, content, time }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex gap-4 
      transition transform hover:scale-[1.01] hover:shadow-lg cursor-pointer"
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt={username}
        className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600"
      />

      {/* Post content */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {username}
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {time}
          </span>
        </div>

        <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
