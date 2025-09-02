// components/PostCard.jsx
import React from "react";
import {PenTool, Trash2, TrashIcon} from "lucide-react";

export default function PostCard({ title, excerpt }) {
  return (
    <button className="text-left bg-base-200 p-5 size-55 rounded-lg text-base-content border -b border-base-300 drop-shadow-xl hover:bg-base-300/60 transition">
      <div /*className="bg-base-200 p-5 size-55 rounded-lg text-base-content border -b border-base-300 drop-shadow-xl"*/> 
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-yellow-950 pb-6">{excerpt}</p>
     <PenTool
     className=" p-2 btn btn-square text-yellow-950 shadow-md bg-slate-700/60 border border-slate-700/30 hover:bg-slate-700/50 mr-5"/>
     <Trash2
     className=" p-2 btn btn-square text-yellow-950 shadow-md bg-red-700/60 border border-red-700/30 hover:bg-red-700/50 "/>
     </div>
    </button> 
  );
}
