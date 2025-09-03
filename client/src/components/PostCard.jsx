import React from "react";
import { PenTool, Trash2 } from "lucide-react";
import { write } from "../../src/utils/api";

export default function PostCard({ title, excerpt, postId, type, file_url, url }) {
  const handleDelete = async () => {
    if (confirm('Delete this post?')) {
      try {
        await write.deletePost(postId);
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert('Failed to delete post');
      }
    }
  };

  const renderContent = () => {
    switch (type) {
      case "Photo":
        return file_url ? (
          <img
            src={file_url}
            alt={title}
            className="max-w-full h-auto rounded-lg mb-4"
          />
        ) : (
          <p className="text-yellow-950 pb-6">{excerpt}</p>
        );
      case "Video":
        return file_url ? (
          <video
            src={file_url}
            controls
            className="max-w-full h-auto rounded-lg mb-4"
          />
        ) : (
          <p className="text-yellow-950 pb-6">{excerpt}</p>
        );
      case "Audio":
        return file_url ? (
          <audio
            src={file_url}
            controls
            className="w-full mb-4"
          />
        ) : (
          <p className="text-yellow-950 pb-6">{excerpt}</p>
        );
      case "Link":
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline pb-6 block"
          >
            {excerpt || url}
          </a>
        ) : (
          <p className="text-yellow-950 pb-6">{excerpt}</p>
        );
      case "Quote":
      case "Text":
      case "Uploader":
      default:
        return <p className="text-yellow-950 pb-6">{excerpt}</p>;
    }
  };

  return (
    <div className="bg-base-200 p-5 rounded-lg text-base-content border-b border-base-300 drop-shadow-xl hover:bg-base-300/60 transition w-full">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {renderContent()}
      <div className="flex gap-4">
        <a href={`/posts/edit/${postId}`}>
          <PenTool className="p-2 btn btn-square text-yellow-950 shadow-md bg-slate-700/60 border border-slate-700/30 hover:bg-slate-700/50" />
        </a>
        <Trash2
          onClick={handleDelete}
          className="p-2 btn btn-square text-yellow-950 shadow-md bg-red-700/60 border border-red-700/30 hover:bg-red-700/50 cursor-pointer"
        />
      </div>
    </div>
  );
}