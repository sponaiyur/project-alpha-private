// src/pages/Landing.jsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Landing = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 500); // small delay before animation starts
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
        >
          Welcome to <span className="text-purple-400">Chyrp Lite</span> - Remastered
        </motion.h1>

        {show && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="mt-6 text-lg md:text-2xl text-gray-200"
          >
            A modern frontend for a timeless CMS ✨
          </motion.p>
        )}

        {/* Buttons */}
        <motion.div
          className="mt-10 flex gap-6 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <Link href="/login">
            <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
              Register
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating particles for vibe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-white rounded-full opacity-30"
            initial={{ y: "100vh", x: Math.random() * window.innerWidth }}
            animate={{ y: -20 }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Landing;