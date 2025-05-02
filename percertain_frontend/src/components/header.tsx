import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Percertain
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/gallery" className="hover:text-blue-300 transition">
            Gallery
          </Link>
          
          {session ? (
            <>
              <Link href="/projects" className="hover:text-blue-300 transition">
                My Projects
              </Link>
              
              <div className="relative group">
                <button className="flex items-center hover:text-blue-300 transition">
                  {session.user?.name || session.user?.email}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg py-2 hidden group-hover:block z-10">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-blue-300 transition">
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
