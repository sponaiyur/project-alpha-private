"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Post {
  id: number;
  title: string;
  body: string;
  date: string;
  comments: number;
  likes: number;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      title: "hi, this ui is very bad.",
      body: "i love how we all hate this. can't they put one plus button to put new blog?",
      date: "31 August 2025",
      comments: 0,
      likes: 5,
    },
    {
      id: 2,
      title: "My first Blog!",
      body: "hi, i dont like this, bye.",
      date: "30 August 2025",
      comments: 2,
      likes: 10,
    },
  ]);

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer mb-6"
          onClick={() => (window.location.href = "/homepage")}
        >
          My Awesome Site
        </h1>

        <nav className="space-y-3">
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Blog
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Email
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Feed
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Admin
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Controls
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Log out
          </a>
        </nav>
      </aside>

      {/* Feed */}
      <main className="flex-1 p-6">
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-md rounded-xl p-6 border"
            >
              {/* Title + Date */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {post.title}
                </h2>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>

              {/* Body */}
              <p className="text-gray-700 mb-4">{post.body}</p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button>

                {/* Likes */}
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 ml-auto"
                >
                  <Heart className="w-5 h-5" />
                  <span>{post.likes}</span>
                </button>
              </div>

              {/* Comments */}
              <p className="text-sm text-gray-500 mt-2">
                {post.comments} comments
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
