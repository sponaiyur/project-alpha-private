import React from "react";
import Sidebar from "../components/SideBar";
import PostCard from "../components/PostCard";

export default function Dashboard() {
  return (
    <div className="flex w-screen h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostCard title="My First Post" excerpt="This is a sample post for the dashboard preview." />
        <PostCard title="Another Post" excerpt="Posts will appear here once connected to the backend." />
        <PostCard title="Chyrp Lite Modern UI" excerpt="Clean, minimal, modular frontend design ready for integration." />
      </div>
    </div>
  );
}
