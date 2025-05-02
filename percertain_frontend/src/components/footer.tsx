import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Percertain</h3>
            <p className="text-gray-400">
              Create AI-powered web applications with an intuitive DSL.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-400 hover:text-white transition">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-400 hover:text-white transition">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/dead-developers/percertain" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Percertain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
