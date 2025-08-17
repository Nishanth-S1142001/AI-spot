"use client";
import { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import NeonBackground from '../ui_components/otherBackground/page';
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToSMS, setAgreeToSMS] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <NeonBackground />
    <div className="min-h-screen  flex items-center justify-between m-20 ">
      <div className="w-full max-w-7xl flex">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex items-st flex-col  p-2 ">
        
          <div className= " mt-[20%]">
            
            <svg width="300" height="250" viewBox="0 0 300 250" className="opacity-80">
              {/* Main geometric shapes */}
              <path
                d="M50 80 L120 40 L180 100 L110 140 Z"
                fill="none"
                stroke="#ADD8E6"
                strokeWidth="2"
              />
              <path
                d="M120 40 L200 60 L180 100 Z"
                fill="none"
                stroke="#ADD8E6"
                strokeWidth="2"
              />
              <path
                d="M110 140 L180 100 L160 180 L90 160 Z"
                fill="none"
                stroke="#ADD8E6"
                strokeWidth="2"
              />
              
              {/* Connecting lines */}
              <line x1="50" y1="80" x2="90" y2="160" stroke="white" strokeWidth="1" opacity="0.6" />
              <line x1="200" y1="60" x2="160" y2="180" stroke="white" strokeWidth="1" opacity="0.6" />
              
              {/* Decorative circles */}
              <circle cx="50" cy="80" r="8" fill="lightgray" opacity="0.8" />
              <circle cx="200" cy="60" r="6" fill="lightgray" opacity="0.6" />
              <circle cx="160" cy="180" r="7" fill="lightgray" opacity="0.7" />
              
              {/* Small decorative elements */}
              <rect x="40" y="200" width="8" height="8" fill="white" opacity="0.5" />
              <rect x="60" y="200" width="8" height="8" fill="white" opacity="0.5" />
              <rect x="80" y="200" width="8" height="8" fill="white" opacity="0.5" />
              <rect x="100" y="200" width="8" height="8" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div className="text-xl text-gray-300   leading-relaxed">
           The text you're looking for is "Lorem ipsum". 
           It's a placeholder text commonly used 
           in design and publishing to demonstrate 
           the visual form of a document or 
           typeface without relying on actual content.
            It's derived from a Latin text but is essentially gibberish to
             most readers, which helps maintain focus on the visual layout. 
          </div>
          
          
        </div>   

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Create your account
              </h2>
              
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm text-gray-600 mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm text-gray-600 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm text-gray-600 mb-2">
                    Phone number
                  </label>
                  <div className="flex">
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-l-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="US">🇺🇸 +1</option>
                        <option value="UK">🇬🇧 +44</option>
                        <option value="CA">🇨🇦 +1</option>
                        <option value="DE">🇩🇪 +49</option>
                        <option value="FR">🇫🇷 +33</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-3 border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="123-456-7890"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm text-gray-600 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8 or more characters with a mix of letters, numbers & symbols
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                      By creating an account I agree to our{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sms"
                      checked={agreeToSMS}
                      onChange={(e) => setAgreeToSMS(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sms" className="text-sm text-gray-700 leading-relaxed">
                      By creating an account I am also consenting to receive SMS messages and emails, including product new feature updates, events, and marketing promotions.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 outline-none"
                >
                  Sign up
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      Log in
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}