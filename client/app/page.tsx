// app/page.tsx
"use client"; // required for client-side interactivity (useState, router)

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {auth} from "../src/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData,setFormData] = useState({
    email:"",
    password:""
  })
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name,value}=e.target;
    setFormData(prev => ({
      ...prev,
      [name] : value
    }))
    if (error) setError("") //clear out any errors if the user starts to type
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); //starts the loading animation, until login ends
    setError("");
    
    try {
      const res = await auth.login(formData.email, formData.password);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user))

      router.push("/dashboard");
    } catch(err: unknown) {
      console.error("Login error:", err);
      
      if (err instanceof Error && 'status' in err) {
        const statusError = err as Error & {status: number}

        if(statusError.status === 401) {
          setError("Invalid Email or password")
        }
        if(statusError.status === 0) {
          setError("Network error. Please check your connection.")
        }
        else {
          setError("Something went wrong. Please try again")
        }
      }
    } finally {
      setLoading(false) //after everything is handled, finish the loading animation
    }
  };


  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="glass-card p-10 w-96 flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold mb-8 text-center">
          Login to Chyrp Lite
        </h2>
        <form className="flex flex-col gap-6 w-full" onSubmit={handleLogin}>
          <div className="relative">
            <input
              name="email"
              type="email"
              placeholder="EMAIL"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
            />
          </div>

          <div className="relative">
            <input
              name="password"
              type="password"
              placeholder="PASSWORD"
              value={formData.password}
              onChange={handleInputChange}
              required
              //disabled={loading}
              className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 cursor-pointer transition transform hover:scale-105">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-gray-400 mt-4 hover:text-white cursor-pointer">
          <Link href="/register">
          New to Chyrp? Register Here!
          </Link>
        </p>
      </div>
    </div>
  );
}
