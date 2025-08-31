// components/LoginCard.jsx
import React, { useState } from "react";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="glass-card p-10 w-96 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <h2 className="text-white text-2xl font-bold mb-8 text-center">Welcome Back</h2>
      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        <div className="input-container relative">
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
          />
          <label className="absolute left-3 top-3 text-gray-400 transition-all pointer-events-none">Email</label>
        </div>
        <div className="input-container relative">
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
          />
          <label className="absolute left-3 top-3 text-gray-400 transition-all pointer-events-none">Password</label>
        </div>
        <button type="submit" className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition transform hover:scale-105">Login</button>
      </form>
      <p className="text-gray-400 mt-4 hover:text-white cursor-pointer">Forgot password?</p>
    </div>
  );
}
