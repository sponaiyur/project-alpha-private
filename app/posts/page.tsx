// pages/Posts.jsx
import React from "react";
import PostCard from "@/components/PostCard";
import { mockPosts } from "../data/mockPosts";
import Link from "next/link";

const Posts = () => {
  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Feed</h1>

        {mockPosts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block">
            <PostCard {...post} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Posts;
