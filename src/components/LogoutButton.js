'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LogoutButton({ className }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${className || ''}`}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
