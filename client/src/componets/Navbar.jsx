import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react'; // Remove this if using actual auth state

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state
  const navigate = useNavigate();

  // Replace with actual logout function from your auth context
 const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };


  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - position changes based on auth state */}
          <div className="flex-shrink-0 flex items-center order-first" >
            <Link to="/" className="flex flex-col items-center">
              <h1 className="text-orange-500 text-2xl font-bold">ReWear</h1>
              <h3 className="ml-2 text-orange-400 hidden text-xs md:inline">Sustainable Fashion</h3>
            </Link>
          </div>

          {/* Navigation Links - shows different options based on auth state */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
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
                  to="/signup" 
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