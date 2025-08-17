"use client";
import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Upload, X } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBackground = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogin = () => {
    console.log('Login attempt:', { username, password, rememberMe });
    // Add your login logic here
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-500"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Decorative Stars */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute bottom-60 left-40 w-1 h-1 bg-white rounded-full opacity-70"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full opacity-60"></div>
      </div>

      {/* Floating Meteors */}
      <div className="absolute inset-0">
        <div className="absolute top-32 right-1/4 w-16 h-0.5 bg-gradient-to-r from-white to-transparent opacity-30 transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-48 left-1/4 w-12 h-0.5 bg-gradient-to-r from-white to-transparent opacity-25 transform rotate-12 animate-pulse"></div>
      </div>

      {/* Background Upload Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition-all duration-300"
          title="Upload background image"
        >
          <Upload size={20} />
        </button>
        {backgroundImage && (
          <button
            onClick={clearBackground}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition-all duration-300"
            title="Clear background image"
          >
            <X size={20} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Decorative Header */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <div className="block text-sm font-medium text-gray-700">Username</div>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="block text-sm font-medium text-gray-700">Password</div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign In
            </button>

            {/* Create Account */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Don't have an account? Create Account
              </button>
            </div>
          </div>

          {/* Footer Attribution */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Designed with ❤️ for modern web
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}