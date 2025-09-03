"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {auth} from "../../src/utils/api.js";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name:"",
    email:"",
    username:"",
    password:"",
    confirmPassword:""
  })
  const [error, setError] = useState("");
  const [loading,setLoading]= useState(false)
  const [success,setSuccess] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    console.log(formData)

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true)
    setError("")

    try {
      console.log("payload:",formData)
      const res = await auth.register(formData.name,formData.email, formData.username, formData.password);
      setSuccess("Account created successfully! Redirecting to login...")

      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch(err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false)
    }
  };
  return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="glass-card p-10 w-96 flex flex-col items-center justify-center">
          <h2 className="text-white text-2xl font-bold mb-8 text-center">
            Register to Chyrp Lite
          </h2>
          <form className="flex flex-col gap-6 w-full" onSubmit={handleRegister}>
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="NAME"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
              />
            </div>

            <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
              />  
            </div>

            <div>
              <input
                  type="text"
                  name="username"
                  placeholder="USERNAME"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
                />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="CONFIRM PASSWORD"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-transparent border-b-2 border-gray-500 text-white outline-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className = "text-green-400 text-sm">{success}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 cursor-pointer transition transform hover:scale-105">
              {loading ? (
                <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Creating account...
              </div>
              ):(
                "Sign Up"
              )}
            </button>
          </form>
          <p className="text-gray-400 mt-4 hover:text-white cursor-pointer">
            <Link href="/login">
            Already a Chyrp user? Login Here!
            </Link>
          </p>
        </div>
      </div>
    );
}