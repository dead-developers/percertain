import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { modRegistry } from '@/lib/mods/registry';
import { modExecutor } from '@/lib/mods/executor';

interface ModExplorerProps {
  onSelectMod?: (modId: string) => void;
}

export function ModExplorer({ onSelectMod }: ModExplorerProps) {
  const [mods, setMods] = useState<any[]>([]);
  const [selectedMod, setSelectedMod] = useState<any>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all available mods
    const allMods = modRegistry.getAllMods();
    setMods(allMods);
  }, []);

  const handleSelectMod = (mod: any) => {
    setSelectedMod(mod);
    setParameters({});
    setResult(null);
    setError(null);
    
    if (onSelectMod) {
      onSelectMod(mod.id);
    }
  };

  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExecuteMod = async () => {
    if (!selectedMod) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate required parameters
      const missingParams = selectedMod.parameters
        .filter((param: any) => param.required && !parameters[param.name])
        .map((param: any) => param.name);
      
      if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }
      
      // Execute the mod
      const modInstance = {
        id: `${Date.now()}`,
        modId: selectedMod.id,
        parameters
      };
      
      const executionResult = await modExecutor.execute(modInstance);
      
      if (!executionResult.success) {
        throw new Error(executionResult.error);
      }
      
      setResult(executionResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    
    if (result.html) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Result</h3>
          <div className="border rounded-md p-4 bg-white" dangerouslySetInnerHTML={{ __html: result.html }} />
        </div>
      );
    }
    
    if (result.imageData) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Generated Image</h3>
          <div className="border rounded-md p-4 bg-white">
            <img src={`data:image/png;base64,${result.imageData}`} alt={result.prompt} className="max-w-full" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Result</h3>
        <pre className="border rounded-md p-4 bg-gray-50 overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Available Mods</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mods.map(mod => (
                <Button
                  key={mod.id}
                  variant={selectedMod?.id === mod.id ? 'primary' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleSelectMod(mod)}
                >
                  {mod.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        {selectedMod ? (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{selectedMod.name}</h2>
              <p className="text-gray-500">{selectedMod.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Parameters</h3>
                  {selectedMod.parameters.map((param: any) => (
                    <div key={param.name} className="mb-3">
                      <Input
                        id={`param-${param.name}`}
                        label={`${param.name}${param.required ? ' *' : ''}`}
                        placeholder={param.description}
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        required={param.required}
                      />
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleExecuteMod}
                  disabled={loading}
                >
                  {loading ? 'Executing...' : 'Execute Mod'}
                </Button>
                
                {error && (
                  <Alert variant="error" title="Error">
                    {error}
                  </Alert>
                )}
                
                {renderResult()}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>Select a mod from the list to explore its capabilities</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
