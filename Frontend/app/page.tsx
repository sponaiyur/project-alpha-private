// app/page.tsx
"use client"; // required for client-side interactivity (useState, router)

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login credentials
    if (email === "admin@blog.com" && password === "password") {
      router.push("/Dashboard"); // redirect to dashboard
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="glass-card p-10 w-96 flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold mb-8 text-center">
          Login to Chyrp Lite
        </h2>
        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
            />
        
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
            />
            
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition transform hover:scale-105">
            SIGN IN
          </button>
        </form>
        <p className="text-gray-400 mt-4 hover:text-white cursor-pointer">
          Forgot password?
        </p>
      </div>
    </div>
  );
}
