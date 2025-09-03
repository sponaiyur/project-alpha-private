"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import FlexibleRichTextEditor from "./RichTextEditor";
import  {write}  from "../../src/utils/api.js"; 

export default function WritePage() {
  const [activeType, setActiveType] = useState("Text");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // For cleanup
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any[]>([]); // Slate Descendant[]
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("[None]");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const contentTypes = [
    "Text",
    "Photo",
    "Audio",
    "Uploader",
    "Video",
    "Link",
    "Quote",
  ];

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      setFile(newFile);
      setFileUrl(URL.createObjectURL(newFile));
    } else {
      setFile(null);
      setFileUrl(null);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Check for token
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please log in to create a post");
      setIsSubmitting(false);
      router.push("/login"); // Redirect to login page
      return;
    }

    // Validate required fields
    if (!title || !activeType || !content.length || !tags || category === "[None]") {
      setError("Please fill in all required fields: title, type, content, tags, and category");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", activeType);
      formData.append("content_json", JSON.stringify(content));
      formData.append("tags", tags);
      formData.append("category", category);
      if (["Photo", "Audio", "Video", "Uploader"].includes(activeType) && file) {
        formData.append("file", file);
      }
      if (activeType === "Link" && url) {
        formData.append("url", url);
      }
      if (activeType === "Quote" && author) {
        formData.append("author", author);
      }

      // Log form data for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await write.post(formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Post created:", response.data);
      // Reset form
      setActiveType("Text");
      setFile(null);
      setFileUrl(null);
      setTitle("");
      setContent([]);
      setUrl("");
      setAuthor("");
      setTags("");
      setCategory("[None]");
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to create post";
      setError(errorMessage);
      if (errorMessage === "Not authenticated" || errorMessage.includes("token")) {
        router.push("/login"); // Redirect to login if authentication fails
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const CloseButton = () => (
    <button
      type="button"
      onClick={() => {
        setActiveType("");
        setFile(null);
        setFileUrl(null);
      }}
      className="absolute top-2 right-2 text-red-500 font-bold text-lg"
    >
      ✖
    </button>
  );

  const BackButton = () => (
    <button
      type="button"
      onClick={() => router.push("/dashboard")}
      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow">
        <h1
          className="text-xl font-bold cursor-pointer hover:text-gray-300 transform transition duration-150 hover:scale-105 active:scale-95"
          onClick={() => router.push("/dashboard")}
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
        <BackButton />
        <div className="flex gap-2 mb-6 flex-wrap">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setFile(null);
                setFileUrl(null);
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

        {activeType && <CloseButton />}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
              placeholder="Enter your title..."
            />
          </div>

          <div>
            {activeType === "Text" && (
              <div>
                <label className="block text-sm font-medium mb-2">Body</label>
                <FlexibleRichTextEditor
                  editorType="fullEditor"
                  onContentChange={setContent}
                />
              </div>
            )}
            {activeType === "Photo" && (
              <div className="flex flex-col gap-4">
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
                {file && fileUrl && (
                  <img
                    src={fileUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg border"
                  />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Caption</label>
                  <FlexibleRichTextEditor
                    editorType="captionEditor"
                    onContentChange={setContent}
                  />
                </div>
              </div>
            )}
            {activeType === "Audio" && (
              <div className="flex flex-col gap-4">
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
                {file && fileUrl && (
                  <audio controls className="w-full mt-2" src={fileUrl} />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <FlexibleRichTextEditor
                    editorType="descriptionEditor"
                    customConfig={{ placeholder: "Describe your audio..." }}
                    onContentChange={setContent}
                  />
                </div>
              </div>
            )}
            {activeType === "Video" && (
              <div className="flex flex-col gap-4">
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
                {file && fileUrl && (
                  <video
                    controls
                    className="max-h-64 rounded-lg border"
                    src={fileUrl}
                  />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <FlexibleRichTextEditor
                    editorType="descriptionEditor"
                    customConfig={{ placeholder: "Describe your video..." }}
                    onContentChange={setContent}
                  />
                </div>
              </div>
            )}
            {activeType === "Uploader" && (
              <div className="flex flex-col gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <FlexibleRichTextEditor
                    editorType="descriptionEditor"
                    customConfig={{ placeholder: "Describe this file..." }}
                    onContentChange={setContent}
                  />
                </div>
              </div>
            )}
            {activeType === "Link" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <FlexibleRichTextEditor
                    editorType="descriptionEditor"
                    customConfig={{ placeholder: "Why are you sharing this link?" }}
                    onContentChange={setContent}
                  />
                </div>
              </div>
            )}
            {activeType === "Quote" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quote</label>
                  <FlexibleRichTextEditor
                    editorType="quoteEditor"
                    onContentChange={setContent}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Quote author"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
                placeholder="e.g. tech, coding, design"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
              >
                <option>[None]</option>
                <option>Technology</option>
                <option>Design</option>
                <option>Personal</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}