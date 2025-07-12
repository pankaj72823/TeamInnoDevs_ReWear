import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { login } = useUser();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/login`,
                { email, password }
            );
            
            if (res.data.token) {
                login(res.data.token); // Use the login function from UserContext
                navigate('/dashboard');
            } else {
                throw new Error('No token received');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
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
            login(token); // Use the login function from UserContext
            navigate('/dashboard');
            window.history.replaceState({}, document.title, "/");
        }
    }, [login, navigate]);

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

                    <form onSubmit={handleLogin} className="space-y-6">
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
                        className="bg-white border-2 mt-6 w-full border-orange-400 py-2 px-6 rounded flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Login with Google
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p className="mb-2">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// import React from 'react'
// import { useEffect } from 'react';
// import axios from 'axios';

// export default function Login() {
//     const [email, setEmail] = React.useState('');
//     const [password, setPassword] = React.useState('');
//     const [error, setError] = React.useState('');
//     const [loading, setLoading] = React.useState(false);
    
  

//     const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_BASE_URL}/api/login`,
//         { email, password }
//       );
//       const token = res.data.token;
//       localStorage.setItem("token", token);
//       alert("Login successful!");
//       window.location.href = "/dashboard";
//     } catch (err) {
//       console.error(err);
//       alert("Login failed!");
//     }
//   };

//   // Google login (OAuth)
//   const handleGoogleLogin = () => {
//     window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
//   };

//   // Handle redirected Google login (token in URL)
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get("token");
//     if (token) {
//       localStorage.setItem("token", token);
//       window.history.replaceState({}, document.title, "/dashboard");
//     }
//   }, []);

//     async function handleSubmit(e) {
//       e.preventDefault();
//       console.log('Login submitted:', { email, password });
    
//     }

//   return (
//      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
//        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
//          {/* Brand Header */}
//          <div className="bg-orange-500 p-6 text-center">
//            <h1 className="text-3xl font-bold text-white">ReWear</h1>
//            <p className="text-orange-100 mt-1">Sustainable fashion through community exchange</p>
//          </div>

//          {/* Login Form */}
//          <div className="p-8">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="Enter your email"
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${loading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} transition duration-200`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Logging in...
//                 </span>
//               ) : 'Login'}
//             </button>
//           </form>
//            <hr className="w-full h-2 mt-4 border-gray-300" />


//       <button
//         onClick={handleGoogleLogin}
//         className="bg-white border-2 mt-6 w-full border-orange-400  py-2 px-6 rounded"
//       >
//         Login with Google
//       </button>

//           <div className="mt-6 text-center text-sm text-gray-600">
//             <p className="mb-2">
//               Don't have an account?{' '}
//               {/* <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
//                 Sign up
//               </Link> */}
//               <h3 className="text-orange-600 hover:text-orange-500 font-medium">Sign up</h3>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
