import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

declare global {
  interface Window {
    monaco: typeof Monaco;
  }
}

export {};