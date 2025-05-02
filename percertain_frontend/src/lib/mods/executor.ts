import { ModExecutor, ModInstance, ModExecutionResult } from './types';
import { modRegistry } from './registry';
import { huggingFaceClient } from '../ai/huggingface';

class ModExecutorImpl implements ModExecutor {
  private cache = new Map<string, { result: any, timestamp: number }>();
  private cacheTTL = 1000 * 60 * 60; // 1 hour
  private maxCacheSize = 100; // Limit cache size to prevent memory issues
  
  async execute(modInstance: ModInstance): Promise<ModExecutionResult> {
    try {
      // Check cache
      const cacheKey = this.getCacheKey(modInstance);
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        return {
          success: true,
          data: cached.result
        };
      }
      
      // Get mod
      const mod = modRegistry.getMod(modInstance.modId);
      
      if (!mod) {
        return {
          success: false,
          error: `Mod with ID ${modInstance.modId} not found`
        };
      }
      
      // Validate parameters
      for (const param of mod.parameters) {
        if (param.required && !modInstance.parameters[param.name]) {
          return {
            success: false,
            error: `Required parameter ${param.name} is missing`
          };
        }
      }
      
      // Execute mod
      const result = await mod.execute(modInstance.parameters);
      
      // Cache result
      this.addToCache(cacheKey, result);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private getCacheKey(modInstance: ModInstance): string {
    return `${modInstance.modId}:${JSON.stringify(modInstance.parameters)}`;
  }
  
  private addToCache(key: string, result: any): void {
    // Check if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
}

export const modExecutor = new ModExecutorImpl();
