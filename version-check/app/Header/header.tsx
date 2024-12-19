// Header.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
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
    router.push('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">App Management System</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li><Link href="/appGroupPage" className="hover:underline">App Groups</Link></li>
            <li><Link href="/profile" className="hover:underline">Profile</Link></li>
            <li><a href="/logout" onClick={handleLogout} className="hover:underline">Logout</a></li>
            <li><span id="welcome-message">{welcomeMessage}</span></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
