import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Documentation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/docs/user-guide" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">User Guide</h2>
              <p className="text-gray-600">
                Comprehensive guide to using Percertain, including the DSL syntax, editor features, and deployment.
              </p>
            </div>
          </Link>
          
          <Link href="/docs/dsl-reference" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">DSL Reference</h2>
              <p className="text-gray-600">
                Detailed reference for the Percertain DSL, including all available sections, components, and actions.
              </p>
            </div>
          </Link>
          
          <Link href="/docs/ai-mods" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">AI Mods</h2>
              <p className="text-gray-600">
                Guide to using AI mods in your applications, including available mods and their parameters.
              </p>
            </div>
          </Link>
          
          <Link href="/docs/examples" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">Examples</h2>
              <p className="text-gray-600">
                Example projects to help you get started with Percertain.
              </p>
            </div>
          </Link>
          
          <Link href="/docs/faq" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">FAQ</h2>
              <p className="text-gray-600">
                Answers to frequently asked questions about Percertain.
              </p>
            </div>
          </Link>
          
          <Link href="/docs/api" className="block">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow h-full">
              <h2 className="text-xl font-bold mb-2">API Reference</h2>
              <p className="text-gray-600">
                Reference for the Percertain API, for developers who want to integrate with Percertain.
              </p>
            </div>
          </Link>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="text-gray-600 mb-6">
            New to Percertain? Follow these steps to create your first AI-powered web application:
          </p>
          
          <ol className="space-y-4 mb-6">
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">1</span>
              <div>
                <h3 className="font-medium">Create an account</h3>
                <p className="text-gray-600">Sign up for a Percertain account to get started.</p>
              </div>
            </li>
            
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">2</span>
              <div>
                <h3 className="font-medium">Create a new project</h3>
                <p className="text-gray-600">Click "New Project" on your dashboard to create your first project.</p>
              </div>
            </li>
            
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">3</span>
              <div>
                <h3 className="font-medium">Write your DSL code</h3>
                <p className="text-gray-600">Use the editor to write your DSL code and see a live preview.</p>
              </div>
            </li>
            
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">4</span>
              <div>
                <h3 className="font-medium">Deploy your application</h3>
                <p className="text-gray-600">Deploy your application to make it accessible online.</p>
              </div>
            </li>
          </ol>
          
          <div className="flex justify-center">
            <Link href="/projects/new">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
                Create Your First Project
              </button>
            </Link>
          </div>
        </div>
        
        <div className="border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If you can't find what you're looking for in the documentation, there are several ways to get help:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Community Forum</h3>
              <p className="text-gray-600 mb-4">
                Ask questions and share your projects with the Percertain community.
              </p>
              <Link href="/forum">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">
                  Visit Forum
                </button>
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Discord Server</h3>
              <p className="text-gray-600 mb-4">
                Join our Discord server to chat with other users and get help in real-time.
              </p>
              <a href="https://discord.gg/percertain" target="_blank" rel="noopener noreferrer">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">
                  Join Discord
                </button>
              </a>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">
                Contact our support team for help with your account or billing issues.
              </p>
              <Link href="/support">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
