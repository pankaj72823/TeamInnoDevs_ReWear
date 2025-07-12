import React from 'react'
import { useEffect } from 'react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
  

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        { email, password }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Login failed!");
    }
  };

  // Google login (OAuth)
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  // Handle redirected Google login (token in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, []);

    async function handleSubmit(e) {
      e.preventDefault();
      console.log('Login submitted:', { email, password });
    
    }

  return (
     <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
         {/* Brand Header */}
         <div className="bg-orange-500 p-6 text-center">
           <h1 className="text-3xl font-bold text-white">ReWear</h1>
           <p className="text-orange-100 mt-1">Sustainable fashion through community exchange</p>
         </div>

         {/* Login Form */}
         <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${loading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} transition duration-200`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>
           <hr className="w-full h-2 mt-4 border-gray-300" />


      <button
        onClick={handleGoogleLogin}
        className="bg-white border-2 mt-6 w-full border-orange-400  py-2 px-6 rounded"
      >
        Login with Google
      </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">
              Don't have an account?{' '}
              {/* <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign up
              </Link> */}
              <h3 className="text-orange-600 hover:text-orange-500 font-medium">Sign up</h3>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
