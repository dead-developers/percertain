"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface Project {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    favorites: number;
  };
}

export default function GalleryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular');

  useEffect(() => {
    fetchProjects();
  }, [sortBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery?sort=${sortBy}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery projects');
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      setError('Error loading gallery. Please try again later.');
      console.error('Error fetching gallery projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to favorite project');
      }
      
      // Update the projects list to reflect the new favorite count
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                _count: { 
                  ...project._count, 
                  favorites: project._count.favorites + 1 
                } 
              }
            : project
        )
      );
    } catch (error) {
      setError('Error favoriting project. Please try again.');
      console.error('Error favoriting project:', error);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Explore AI Web Apps</h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <Input
              id="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <div className="flex space-x-2">
              <Button 
                variant={sortBy === 'popular' ? 'primary' : 'outline'}
                onClick={() => setSortBy('popular')}
              >
                Popular
              </Button>
              <Button 
                variant={sortBy === 'recent' ? 'primary' : 'outline'}
                onClick={() => setSortBy('recent')}
              >
                Recent
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading gallery...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium text-gray-600 mb-2">No projects found</h2>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No projects matching "${searchTerm}"` 
                : "No public projects available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 truncate">{project.name}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        {project.user.image ? (
                          <img 
                            src={project.user.image} 
                            alt={project.user.name} 
                            className="w-6 h-6 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
                        )}
                        <span>{project.user.name}</span>
                      </div>
                      <span>
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        View App
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFavorite(project.id)}
                        className="flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {project._count.favorites}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
