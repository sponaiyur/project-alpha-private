// components/Sidebar.jsx
import React from "react";
import {PlusIcon,Search} from "lucide-react";

export default function SideBar() {
  return (
    <div className="bg-base-300 text-primary-content w-60 h-screen p-8 flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Chyrp Lite</h1>

       <div className="flex justify-start">
      
        <input
          type="text"
          placeholder=" 🔍 Search blogs..."
          className="input input-bordered w-40 max-w-xl h-10 text-left p-0"
       />
       </div>
      <div class = "overflow-x-auto mt-1">
        <a href="#" className=" text-base text-yellow-950 btn btn-md bg-base-300 border-base-100 drop-shadow-md hover:bg-base-200"> 
          <PlusIcon className = "size-5 text-yellow-950"/>
          New Blog
        </a>
        <table class = "table text-amber-950 mt-10">
          <tbody>
           <tr class = "hover"><a href = "#" className=" p-2 text-base">➤ Feed</a></tr>
           <tr class = "hover"><a href="#" className="p-2 text-base">➤ /*UserName*/</a></tr>
           <tr class = "hover"><a href="#" className="p-2 text-base">➤ Controls</a></tr>
           <tr class = "hover"><a href="#" className="px-2 text-base">➤ Log OUT</a></tr>
      </tbody>
      </table>
      </div>

      <h1 className="text-2xl font-bold">Recent Posts</h1>
      <table class = "table text-amber-950">
          <tbody>
           <tr class = "hover"><a href="#" className="p-2 text-base">➤ Chyrp Lite...</a></tr>
           <tr class = "hover"><a href="#" className="px-2 text-base">➤ Another Post</a></tr>
      </tbody>

      </table>
       <h1 className="text-2xl font-bold">Archive </h1>
      <table class = "table text-amber-950">
          <tbody>
           <tr class = "hover"><a href="#" className="p-2 text-base">➤ old blog</a></tr>
      </tbody>
      </table>
    </div>
    
  )
}
