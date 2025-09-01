"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react"; // back arrow icon
import { useRouter } from "next/navigation"; // ✅ router import

export default function WritePage() {
  const [activeType, setActiveType] = useState("Text");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter(); // ✅ initialize router

  const contentTypes = [
    "Text",
    "Photo",
    "Audio",
    "Uploader",
    "Video",
    "Link",
    "Quote",
  ];

  // Formatting command handler
  const handleFormat = (command: string) => {
    document.execCommand(command, false, "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Toolbar reusable
  const Toolbar = () => (
    <div className="flex gap-2 mb-2">
      <button
        type="button"
        onClick={() => handleFormat("bold")}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => handleFormat("italic")}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => handleFormat("underline")}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 underline"
      >
        U
      </button>
    </div>
  );

  // X button
  const CloseButton = () => (
    <button
      type="button"
      onClick={() => {
        setActiveType("");
        setFile(null);
      }}
      className="absolute top-2 right-2 text-red-500 font-bold text-lg"
    >
      ✖
    </button>
  );

  // ✅ Back button (now functional)
  const BackButton = () => (
    <button
      type="button"
      onClick={() => router.push("/homepage")} // redirect here
      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow">
  <h1
    className="text-xl font-bold cursor-pointer hover:text-gray-300 transform transition duration-150 hover:scale-105 active:scale-95"
    onClick={() => router.push("/homepage")} // Redirect to homepage on click
  >
    My Awesome Site
  </h1>
  <nav className="flex gap-4">
          {["Write", "Manage", "Settings", "Extend"].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg relative">
        {/* ✅ Back Button */}
        <BackButton />

        {/* Content type selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setFile(null); // reset file when switching
              }}
              className={`px-4 py-2 rounded-full border transition ${
                activeType === type
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Form */}
        {activeType && <CloseButton />}
        <form className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
              placeholder="Enter your title..."
            />
          </div>

          {/* Body area changes based on type */}
          <div>
            {activeType === "Text" && (
              <>
                <label className="block text-sm font-medium mb-2">Body</label>
                <Toolbar />
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
                ></div>
              </>
            )}

            {/* Photo */}
            {activeType === "Photo" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label
                  htmlFor="photoUpload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block w-fit"
                >
                  Choose Photo
                </label>
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-h-64 rounded-lg border"
                  />
                )}
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
                  placeholder="Add a description..."
                ></textarea>
              </div>
            )}

            {/* Audio */}
            {activeType === "Audio" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label
                  htmlFor="audioUpload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block w-fit"
                >
                  Choose Audio
                </label>
                <input
                  type="file"
                  id="audioUpload"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file && (
                  <audio
                    controls
                    className="w-full mt-2"
                    src={URL.createObjectURL(file)}
                  />
                )}
              </div>
            )}

            {/* Video */}
            {activeType === "Video" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label
                  htmlFor="videoUpload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block w-fit"
                >
                  Choose Video
                </label>
                <input
                  type="file"
                  id="videoUpload"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file && (
                  <video
                    controls
                    className="max-h-64 rounded-lg border"
                    src={URL.createObjectURL(file)}
                  />
                )}
              </div>
            )}

            {/* Uploader */}
            {activeType === "Uploader" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg inline-block w-fit"
                >
                  Choose File
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-sm text-gray-700">Selected: {file.name}</p>
                )}
              </div>
            )}

            {/* Link */}
            {activeType === "Link" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label className="block text-sm font-medium mb-1">
                  Insert Link
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            )}

            {/* Quote */}
            {activeType === "Quote" && (
              <div className="flex flex-col gap-4">
                <Toolbar />
                <label className="block text-sm font-medium mb-1">
                  Add Quote
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  placeholder="Enter the quote..."
                ></textarea>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input
                  type="text"
                  placeholder="Quote author"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
                placeholder="e.g. tech, coding, design"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none">
                <option>[None]</option>
                <option>Technology</option>
                <option>Design</option>
                <option>Personal</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Publish
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
