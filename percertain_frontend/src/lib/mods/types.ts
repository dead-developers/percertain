export interface ModRegistry {
  registerMod(mod: any): void;
  getMod(id: string): any;
  getAllMods(): any[];
  getModsByPrefixSuffix(prefix: string, suffix: string): any[];
}

export interface ModExecutor {
  execute(modInstance: ModInstance): Promise<ModExecutionResult>;
}

export interface ModInstance {
  id: string;
  modId: string;
  parameters: Record<string, any>;
}

export interface ModExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ModParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface Mod {
  id: string;
  name: string;
  description: string;
  prefixes: string[];
  suffixes: string[];
  parameters: ModParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
}
