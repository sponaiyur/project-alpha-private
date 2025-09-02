import React from "react";
import  SideBar  from "../../src/components/SideBar.jsx";
import  PostCard  from "../../src/components/PostCard.jsx";

export default function Dashboard() {
  return (
    <div className="flex w-screen h-screen">
      <SideBar/>
      <div className="flex-1 p-10 flex flex-col gap-4">
        <PostCard title="My First Post" excerpt="This is a sample post for the dashboard preview." />
        <PostCard title="Another Post" excerpt="Posts will appear here once connected to the backend." />
        <PostCard title="Chyrp Lite Modern UI" excerpt="Clean, minimal, modular frontend design ready for integration." />
      </div>
    </div>
  );
}
