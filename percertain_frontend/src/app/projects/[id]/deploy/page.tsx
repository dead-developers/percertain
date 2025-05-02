import React from 'react';
import { DeploymentPanel } from '@/components/deployment/deployment-panel';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function DeploymentPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Deploy Project</h1>
        
        <p className="text-gray-600 mb-8">
          Deploy your Percertain project to make it accessible online. 
          Once deployed, your app will be available at a unique URL that you can share with others.
        </p>
        
        <DeploymentPanel projectId={params.id} />
      </main>
      
      <Footer />
    </div>
  );
}
