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

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      setError('Error loading projects. Please try again later.');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newProject,
          dslCode: `@app "${newProject.name}"\n@description "${newProject.description}"\n\n@variables:\n  title = "${newProject.name}"\n\n@ui:\n  layout:\n    - section: header\n    - section: main\n  \n  components:\n    header:\n      - heading: {text: "{title}"}\n    \n    main:\n      - text: {content: "Welcome to my Percertain app!"}\n\n@mods:\n  - data-think\n`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const data = await response.json();
      
      // Navigate to the project editor
      router.push(`/project-editor/${data.id}`);
    } catch (error) {
      setError('Error creating project. Please try again.');
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => setShowNewProjectForm(!showNewProjectForm)}>
            {showNewProjectForm ? 'Cancel' : 'New Project'}
          </Button>
        </div>
        
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {showNewProjectForm && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-bold">Create New Project</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input
                  id="name"
                  name="name"
                  label="Project Name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  id="description"
                  name="description"
                  label="Description"
                  value={newProject.description}
                  onChange={handleInputChange}
                />
                <div className="flex items-center">
                  <input
                    id="isPublic"
                    name="isPublic"
                    type="checkbox"
                    checked={newProject.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this project public in the gallery
                  </label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {loading && !showNewProjectForm ? (
          <div className="text-center py-8">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium text-gray-600 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-4">Create your first project to get started</p>
            <Button onClick={() => setShowNewProjectForm(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 truncate">{project.name}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-4">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {project._count.favorites}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        onClick={() => router.push(`/project-editor/${project.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        View
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
