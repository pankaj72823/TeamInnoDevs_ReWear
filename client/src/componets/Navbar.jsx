import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserContext'; // Update path as needed
import { useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  useEffect(()=>{
    console.log(user);
  })
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center order-first">
            <Link to="/" className="flex flex-col items-center">
              <h1 className="text-orange-500 text-2xl font-bold">ReWear</h1>
              <h3 className="ml-2 text-orange-400 hidden text-xs md:inline">Sustainable Fashion</h3>
            </Link>
          </div>

          {/* Navigation Links - shows different options based on auth state */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Home
                </Link>
                <Link 
                  to="/browse" 
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Browse
                </Link>
                <Link 
                  to="/add-item" 
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Add Item
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;