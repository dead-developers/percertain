"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface DeploymentProps {
  projectId: string;
}

interface Deployment {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  environment: string;
  url: string | null;
  createdAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export function DeploymentPanel({ projectId }: DeploymentProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDeployments();
  }, [projectId]);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/deploy`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }
      
      const data = await response.json();
      setDeployments(data);
    } catch (error) {
      setError('Error loading deployments. Please try again later.');
      console.error('Error fetching deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to deploy project');
      }
      
      const data = await response.json();
      setSuccess('Deployment initiated successfully!');
      
      // Poll for deployment status updates
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/projects/${projectId}/deploy`);
        const deployments = await statusResponse.json();
        
        setDeployments(deployments);
        
        // Check if the latest deployment is completed
        const latestDeployment = deployments[0];
        if (latestDeployment && latestDeployment.id === data.id && latestDeployment.status !== 'PENDING') {
          clearInterval(pollInterval);
          
          if (latestDeployment.status === 'COMPLETED') {
            setSuccess(`Deployment completed successfully! Your app is live at ${latestDeployment.url}`);
          } else {
            setError('Deployment failed. Please try again.');
          }
        }
      }, 2000);
      
      // Clear interval after 30 seconds to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);
      
      // Fetch deployments immediately to show the pending deployment
      fetchDeployments();
    } catch (error) {
      setError('Error deploying project. Please try again.');
      console.error('Error deploying project:', error);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Deployments</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Deploy your app to Vercel to make it accessible online.</p>
            <Button 
              onClick={handleDeploy} 
              disabled={deploying}
            >
              {deploying ? 'Deploying...' : 'Deploy to Production'}
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Deployment History</h3>
            {loading ? (
              <p className="text-gray-500">Loading deployments...</p>
            ) : deployments.length === 0 ? (
              <p className="text-gray-500">No deployments yet</p>
            ) : (
              <div className="space-y-3">
                {deployments.map(deployment => (
                  <div key={deployment.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            deployment.status === 'COMPLETED' ? 'bg-green-500' : 
                            deployment.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="font-medium">
                            {deployment.status === 'COMPLETED' ? 'Completed' : 
                             deployment.status === 'FAILED' ? 'Failed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Deployed by {deployment.user.name} on {new Date(deployment.createdAt).toLocaleString()}
                        </p>
                        {deployment.completedAt && (
                          <p className="text-sm text-gray-500">
                            Completed at {new Date(deployment.completedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {deployment.url && (
                        <a 
                          href={deployment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Live Site
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
