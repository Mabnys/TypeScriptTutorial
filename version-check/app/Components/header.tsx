import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState<string>('Welcome');
  const router = useRouter();

  useEffect(() => {
    // Function to get cookie value
    const getCookieValue = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      return parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
    };

    // Get user email from cookie
    const userEmail = getCookieValue('userEmail');

    if (userEmail) {
      const firstName = userEmail.split('@')[0].split('.')[0];
      const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      setWelcomeMessage(`Welcome, ${capitalizedFirstName}`);
    } else {
      console.warn('No user email found in cookies.');
    }
  }, []);

  // Function to clear user session
  const clearUserSession = () => {
    console.log('Clearing user session...');
    document.cookie.split(';').forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });
    localStorage.clear();
  };

  // Handle logout
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    clearUserSession();
    console.log('User logged out. Redirecting to login page.');
    router.push('http://localhost:3000');
  };

  return (
    // Header styling
    <header className="bg-gray-800 text-white px-7.5 py-3.75 flex items-center justify-between fixed top-0 left-0 right-0 w-full h-15 z-10 shadow-lg">
      {/* Left side of the header */}
      <div className="header-left flex gap-5">
        <Link href="/AppGroups" id="appgroup-link" className="text-white no-underline text-base font-medium transition-colors duration-300 hover:text-blue-500">
          Version Check
        </Link>
      </div>

      {/* Right side of the header */}
      <div className="header-right flex items-center gap-2.5 ml-auto whitespace-nowrap pr-7.5">
        {/* Welcome message */}
        <span id="welcome-message" className="text-base">{welcomeMessage}</span>

        {/* Logout button */}
        <Link 
          id="logout-button" 
          href="/login" 
          onClick={handleLogout}
          className="text-blue-400 font-bold no-underline px-3 py-1.5 rounded-md bg-white border-2 border-red-400 transition-colors duration-300 cursor-pointer hover:bg-red-400 hover:text-white"
        >
          Log out
        </Link>
      </div>
    </header>
  );
};

export default Header;
