import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-blue-400">TeamTasker</h1>
        <Link to="/projects" className="hover:text-gray-300 font-medium">Projects</Link>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-300 text-sm">Hello, {user.name} ({user.role})</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
