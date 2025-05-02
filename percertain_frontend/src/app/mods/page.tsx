import React from 'react';
import { ModExplorer } from '@/components/mods/mod-explorer';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ModsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Mods Explorer</h1>
        
        <p className="text-gray-600 mb-8">
          Explore the AI capabilities available in Percertain through our mod system. 
          Select a mod from the list to see its parameters and test its functionality.
        </p>
        
        <ModExplorer />
      </main>
      
      <Footer />
    </div>
  );
}
