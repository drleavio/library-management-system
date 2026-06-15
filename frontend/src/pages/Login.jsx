import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/request-otp', { phone });
      toast.success('OTP sent to WhatsApp');
      setStep(2);
    } catch (err) {
      toast.error('Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isLogin) {
        res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/login', { phone, otp });
      } else {
        res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/signup', { phone, otp, name, libraryName });
      }
      localStorage.setItem('adminToken', res.data.token);
      if (res.data.libraryId) localStorage.setItem('libraryId', res.data.libraryId);
      if (res.data.library) localStorage.setItem('libraryId', res.data.library._id);
      
      toast.success(isLogin ? 'Logged in successfully' : 'Library registered successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP or error occurred');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* // left side */}
<div className="w-1/2 flex flex-col justify-center px-16 bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100 relative overflow-hidden">

  
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-indigo-600">
      LibPro
    </h2>
  </div>

  <h1 className="text-6xl font-extrabold leading-tight text-gray-900">
    Welcome to <br />
    <span className="text-indigo-600">LibPro.</span>
  </h1>

  <p className="text-gray-600 mt-5 text-lg max-w-lg">
    Manage your library easily with secure OTP based login.
  </p>

  <div className="mt-10 space-y-5">

    <div className="flex items-start gap-4">
      <div className="bg-white p-3 rounded-xl shadow">
        📚
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">
          Smart Book Management
        </h3>
        <p className="text-gray-500 text-sm">
          Add, organize and track books.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4">
      <div className="bg-white p-3 rounded-xl shadow">
        👥
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">
          Member Management
        </h3>
        <p className="text-gray-500 text-sm">
          Manage members and records.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4">
      <div className="bg-white p-3 rounded-xl shadow">
        📊
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">
          Analytics Dashboard
        </h3>
        <p className="text-gray-500 text-sm">
          Get real-time library insights.
        </p>
      </div>
    </div>

  </div>

</div>

    {/* // right side */}
    <div className="w-1/2 flex items-center justify-center bg-gray-50">
    {/* <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-100"> */}
       <div className="bg-white p-10 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-yellow-500"></div>
        {/* <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          LibPro 
          </h2>  */}
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
  Welcome Back
</h1>

<p className="text-center text-gray-500 mb-8">
  Sign in to continue to your library dashboard
</p>
      
        {step === 1 && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            <button 
              // className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
         className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
  isLogin
    ? 'bg-indigo-600 text-white shadow-sm'
    : 'text-gray-600 hover:bg-gray-200'
}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setIsLogin(false)}
            >
              Register Library
            </button>
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Your Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Library Name</label>
                  <input type="text" value={libraryName} onChange={(e) => setLibraryName(e.target.value)} placeholder="Central City Library" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-800">WhatsApp Number</label>
              
              <input
  type="text"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="+91 98765 43210"
  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
  required
/>
            </div>
            
            <button
  type="submit"
  className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-300"
>
  Send OTP
</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Enter OTP (Use 1234 for testing)</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="1234" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1">
              {isLogin ? 'Login' : 'Create Library'}
            </button>
          </form>
        )}
      </div>
    </div>
    </div>
    // </div>
  );
}
