
/**
 * Header Component
 *
 * This is the top navigation bar for the OLX Clone app. It includes:
 * - Home link
 * - Location selector (stores location in localStorage)
 * - Search input and button
 * - User menu (add product, favourites, my ads, login/logout)
 *
 * Key concepts:
 * - Uses React Router for navigation
 * - Uses localStorage to persist user location and authentication token
 * - Shows/hides menu options based on login status
 * - Uses Tailwind CSS for styling
 *
 * If you're new to React, see comments below for how state, props, and events work in this file.
 */

import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useState, useEffect } from 'react';


/**
 * Props for Header component
 * - search: current search value
 * - onSearch: function to update search value
 * - onSearchSubmit: function to handle search button click
 */
interface HeaderProps {
  search?: string;
  onSearch?: (searchValue: string) => void;
  onSearchSubmit?: () => void;
}


const Header: React.FC<HeaderProps> = ({ search, onSearch = () => {}, onSearchSubmit = () => {} }) => {
  // loc: user's selected location (stored in localStorage)
  const [loc, setLoc] = useState<string | null>(null);
  // showOver: whether the user menu dropdown is visible
  const [showOver, setShowOver] = useState(false);

  // React Router navigation hook
  const navigate = useNavigate();

  // On mount, load location from localStorage (if set previously)
  useEffect(() => {
    const userLoc = localStorage.getItem('userLoc');
    if (userLoc) {
      setLoc(userLoc);
    }
  }, []);

  // Logout: clear token/userId and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // List of available locations for the dropdown
  const locations = [
    {
      latitude: 28.6139,
      longitude: 77.2090,
      placeName: 'New Delhi, Delhi',
    },
    {
      latitude: 19.0760,
      longitude: 72.8777,
      placeName: 'Mumbai, Maharashtra',
    },
  ];


  // Render the header UI
  return (
    <div className="flex justify-between items-center py-2 px-5 bg-gray-50 border-b-3 border-white shadow-md">
      {/* Left side: Home link, location selector, search bar */}
      <div className="flex items-center space-x-4">
        {/* Home link navigates to main page */}
        <Link className="text-primary-800 hover:text-primary-600 font-semibold" to="/">
          HOME
        </Link>
        {/* Location dropdown: saves selected location to localStorage */}
        <select
          value={loc || ''}
          onChange={(e) => {
            localStorage.setItem('userLoc', e.target.value);
            setLoc(e.target.value);
          }}
          className="border-2 border-primary-700 rounded-md p-1"
        >
          {locations.map((item, index) => (
            <option key={index} value={`${item.latitude},${item.longitude}`}>
              {item.placeName}
            </option>
          ))}
        </select>
        {/* Search input and button */}
        <input
          className="ml-20 outline-none pl-2 w-96 h-11 border-2 border-primary-700 rounded-l-md"
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search..."
        />
        <button
          className="h-11 bg-primary-700 text-white rounded-r-md outline-none border-none px-4"
          onClick={onSearchSubmit}
        >
          <FaSearch />
        </button>
      </div>

      {/* Right side: User menu dropdown (shows different options if logged in) */}
      <div className="relative">
        <div
          onClick={() => {
            setShowOver(!showOver);
          }}
          className="flex justify-center items-center bg-primary-700 w-10 h-10 text-white text-sm rounded-full cursor-pointer"
        >
          N {/* Replace with user initial/avatar if available */}
        </div>

        {showOver && (
          <div className="absolute top-0 right-0 mt-12 mr-12 min-h-28 w-52 bg-primary-700 text-white text-sm rounded-md shadow-lg z-10">
            {/* Show menu options only if user is logged in (token exists) */}
            <div className="py-2">
              {!!localStorage.getItem('token') && (
                <Link to="/add-product">
                  <button className="block w-full text-left px-4 py-2 hover:bg-primary-600">ADD PRODUCT</button>
                </Link>
              )}
            </div>
            <div className="py-2">
              {!!localStorage.getItem('token') && (
                <Link to="/liked">
                  <button className="block w-full text-left px-4 py-2 hover:bg-primary-600">FAVOURITES</button>
                </Link>
              )}
            </div>
            <div className="py-2">
              {!!localStorage.getItem('token') && (
                <Link to="/my-products">
                  <button className="block w-full text-left px-4 py-2 hover:bg-primary-600">MY ADS</button>
                </Link>
              )}
            </div>
            <div className="py-2">
              {/* If not logged in, show login button. If logged in, show logout button. */}
              {!localStorage.getItem('token') ? (
                <Link to="/login">
                  <button className="block w-full text-left px-4 py-2 hover:bg-primary-600">LOGIN</button>
                </Link>
              ) : (
                <button className="block w-full text-left px-4 py-2 hover:bg-primary-600" onClick={handleLogout}>
                  LOGOUT
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// This component is reusable and can be customized for more locations, user avatars, etc.
export default Header;
