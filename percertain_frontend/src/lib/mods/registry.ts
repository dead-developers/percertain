import { ModRegistry, Mod } from './types';
import { huggingFaceClient } from '../ai/huggingface';

class ModRegistryImpl implements ModRegistry {
  private mods: Record<string, Mod> = {};
  
  registerMod(mod: Mod): void {
    this.mods[mod.id] = mod;
  }
  
  getMod(id: string): Mod | undefined {
    return this.mods[id];
  }
  
  getAllMods(): Mod[] {
    return Object.values(this.mods);
  }
  
  getModsByPrefixSuffix(prefix: string, suffix: string): Mod[] {
    return Object.values(this.mods).filter(mod => 
      mod.prefixes.includes(prefix) && mod.suffixes.includes(suffix)
    );
  }
}

export const modRegistry = new ModRegistryImpl();

// Register built-in mods
modRegistry.registerMod({
  id: 'data-think',
  name: 'Data Thinking',
  description: 'Analyzes data and generates insights',
  prefixes: ['data'],
  suffixes: ['think'],
  parameters: [
    {
      name: 'data',
      type: 'string',
      description: 'Data to analyze',
      required: true,
    },
    {
      name: 'question',
      type: 'string',
      description: 'Question to answer about the data',
      required: true,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      const prompt = `Analyze this data and answer the question: ${params.question}\n\nData: ${params.data}`;
      const model = await huggingFaceClient.selectBestModel('text-generation', prompt);
      const result = await huggingFaceClient.textGeneration(prompt, model);
      return {
        insights: result,
        model: model
      };
    } catch (error) {
      console.error('Error executing data-think mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: `Analysis of ${params.data}: ${params.question} could not be completed.`
      };
    }
  }
});

modRegistry.registerMod({
  id: 'data-visual',
  name: 'Data Visualization',
  description: 'Creates visualizations from data',
  prefixes: ['data'],
  suffixes: ['visual'],
  parameters: [
    {
      name: 'data',
      type: 'string',
      description: 'Data to visualize (JSON format)',
      required: true,
    },
    {
      name: 'type',
      type: 'string',
      description: 'Type of visualization (bar, line, pie, etc.)',
      required: true,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      // Parse the data if it's a string
      let parsedData;
      try {
        parsedData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
      } catch (e) {
        return {
          error: 'Invalid JSON data',
          html: `<div class="error">Invalid JSON data: ${params.data}</div>`
        };
      }
      
      // Generate visualization code based on the type
      const chartType = params.type.toLowerCase();
      
      // Generate HTML/JS for the chart
      let html = '';
      
      switch (chartType) {
        case 'bar':
          html = generateBarChart(parsedData);
          break;
        case 'line':
          html = generateLineChart(parsedData);
          break;
        case 'pie':
          html = generatePieChart(parsedData);
          break;
        default:
          html = generateGenericChart(parsedData, chartType);
      }
      
      return {
        html,
        data: parsedData,
        type: chartType
      };
    } catch (error) {
      console.error('Error executing data-visual mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        html: `<div class="error">Error generating ${params.type} chart: ${error instanceof Error ? error.message : 'Unknown error'}</div>`
      };
    }
  }
});

modRegistry.registerMod({
  id: 'visual-think',
  name: 'Visual Thinking',
  description: 'Analyzes images and generates insights',
  prefixes: ['visual'],
  suffixes: ['think'],
  parameters: [
    {
      name: 'image',
      type: 'string',
      description: 'Image URL to analyze',
      required: true,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      const result = await huggingFaceClient.imageClassification(params.image);
      return {
        classifications: result,
        imageUrl: params.image
      };
    } catch (error) {
      console.error('Error executing visual-think mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: `Analysis of image at ${params.image} could not be completed.`
      };
    }
  }
});

modRegistry.registerMod({
  id: 'visual-create',
  name: 'Visual Creation',
  description: 'Generates images from text prompts',
  prefixes: ['visual'],
  suffixes: ['create'],
  parameters: [
    {
      name: 'prompt',
      type: 'string',
      description: 'Text prompt describing the image to generate',
      required: true,
    },
    {
      name: 'style',
      type: 'string',
      description: 'Style of the image (realistic, cartoon, sketch, etc.)',
      required: false,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      const fullPrompt = params.style 
        ? `${params.prompt}, in ${params.style} style` 
        : params.prompt;
        
      const result = await huggingFaceClient.imageGeneration(fullPrompt);
      return {
        imageData: result,
        prompt: fullPrompt
      };
    } catch (error) {
      console.error('Error executing visual-create mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: `Image generation for "${params.prompt}" could not be completed.`
      };
    }
  }
});

modRegistry.registerMod({
  id: 'code-think',
  name: 'Code Thinking',
  description: 'Analyzes code and generates insights',
  prefixes: ['code'],
  suffixes: ['think'],
  parameters: [
    {
      name: 'code',
      type: 'string',
      description: 'Code to analyze',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Programming language of the code',
      required: false,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      const language = params.language || 'python';
      const prompt = `Analyze this ${language} code and provide insights:\n\n\`\`\`${language}\n${params.code}\n\`\`\``;
      const model = await huggingFaceClient.selectBestModel('text-generation', prompt);
      const result = await huggingFaceClient.textGeneration(prompt, model);
      
      return {
        insights: result,
        language: language,
        model: model
      };
    } catch (error) {
      console.error('Error executing code-think mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: `Analysis of code could not be completed.`
      };
    }
  }
});

modRegistry.registerMod({
  id: 'code-create',
  name: 'Code Creation',
  description: 'Generates code from text descriptions',
  prefixes: ['code'],
  suffixes: ['create'],
  parameters: [
    {
      name: 'description',
      type: 'string',
      description: 'Description of the code to generate',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: 'Programming language to generate',
      required: true,
    }
  ],
  execute: async (params: Record<string, any>) => {
    try {
      const prompt = `Generate ${params.language} code for: ${params.description}`;
      const model = await huggingFaceClient.selectBestModel('text-generation', prompt);
      const result = await huggingFaceClient.textGeneration(prompt, model);
      
      // Extract code from the result
      const codeMatch = result.match(/```[\s\S]*?```/);
      const code = codeMatch 
        ? codeMatch[0].replace(/```[\w]*\n/, '').replace(/```$/, '') 
        : result;
      
      return {
        code: code,
        language: params.language,
        model: model
      };
    } catch (error) {
      console.error('Error executing code-create mod:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: `Code generation for "${params.description}" could not be completed.`
      };
    }
  }
});

// Helper functions for chart generation
function generateBarChart(data: any) {
  // Simple bar chart using HTML and inline styles
  let html = `
    <div class="chart-container">
      <div class="chart-title">Bar Chart</div>
      <div class="bar-chart">
  `;
  
  // Extract labels and values
  const labels = Object.keys(data);
  const values = Object.values(data) as number[];
  const maxValue = Math.max(...values);
  
  // Generate bars
  for (let i = 0; i < labels.length; i++) {
    const percentage = (values[i] / maxValue) * 100;
    html += `
      <div class="bar-item">
        <div class="bar-label">${labels[i]}</div>
        <div class="bar-value" style="width: ${percentage}%;">${values[i]}</div>
      </div>
    `;
  }
  
  html += `
      </div>
    </div>
    <style>
      .chart-container {
        font-family: sans-serif;
        margin: 20px 0;
      }
      .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-item {
        display: flex;
        align-items: center;
      }
      .bar-label {
        width: 100px;
        text-align: right;
        padding-right: 10px;
      }
      .bar-value {
        background-color: #3b82f6;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        text-align: right;
        min-width: 30px;
      }
    </style>
  `;
  
  return html;
}

function generateLineChart(data: any) {
  // Simple line chart using SVG
  const width = 400;
  const height = 200;
  const padding = 40;
  
  // Extract data points
  const points = Array.isArray(data) ? data : Object.entries(data).map(([label, value]) => ({ label, value }));
  
  // Calculate scales
  const xScale = (width - padding * 2) / (points.length - 1);
  const yValues = points.map(p => typeof p.value === 'number' ? p.value : parseFloat(p.value));
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues);
  const yScale = (height - padding * 2) / (maxY - minY || 1);
  
  // Generate SVG path
  let pathData = '';
  for (let i = 0; i < points.length; i++) {
    const x = padding + i * xScale;
    const y = height - padding - (yValues[i] - minY) * yScale;
    pathData += (i === 0 ? 'M' : 'L') + `${x},${y}`;
  }
  
  let html = `
    <div class="chart-container">
      <div class="chart-title">Line Chart</div>
      <svg width="${width}" height="${height}">
        <path d="${pathData}" stroke="#3b82f6" stroke-width="2" fill="none" />
  `;
  
  // Add points
  for (let i = 0; i < points.length; i++) {
    const x = padding + i * xScale;
    const y = height - padding - (yValues[i] - minY) * yScale;
    html += `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" />`;
    
    // Add labels
    html += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="12">${points[i].label}</text>`;
  }
  
  // Add y-axis labels
  html += `<text x="10" y="${height - padding}" font-size="12">${minY}</text>`;
  html += `<text x="10" y="${padding + 10}" font-size="12">${maxY}</text>`;
  
  html += `
      </svg>
    </div>
    <style>
      .chart-container {
        font-family: sans-serif;
        margin: 20px 0;
      }
      .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
    </style>
  `;
  
  return html;
}

function generatePieChart(data: any) {
  // Simple pie chart using SVG
  const width = 300;
  const height = 300;
  const radius = 100;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Extract labels and values
  const labels = Object.keys(data);
  const values = Object.values(data) as number[];
  const total = values.reduce((sum, value) => sum + value, 0);
  
  let html = `
    <div class="chart-container">
      <div class="chart-title">Pie Chart</div>
      <svg width="${width}" height="${height}">
  `;
  
  // Generate pie slices
  let startAngle = 0;
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  
  for (let i = 0; i < values.length; i++) {
    const percentage = values[i] / total;
    const endAngle = startAngle + percentage * 2 * Math.PI;
    
    // Calculate path
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${centerX},${centerY}`,
      `L ${x1},${y1}`,
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
      'Z'
    ].join(' ');
    
    const color = colors[i % colors.length];
    
    html += `<path d="${pathData}" fill="${color}" stroke="white" stroke-width="1" />`;
    
    // Add label
    const labelAngle = startAngle + (endAngle - startAngle) / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    
    html += `<text x="${labelX}" y="${labelY}" text-anchor="middle" fill="white" font-size="12">${Math.round(percentage * 100)}%</text>`;
    
    startAngle = endAngle;
  }
  
  // Add legend
  html += `<g transform="translate(${width - 100}, 20)">`;
  for (let i = 0; i < labels.length; i++) {
    const color = colors[i % colors.length];
    html += `
      <rect x="0" y="${i * 20}" width="15" height="15" fill="${color}" />
      <text x="20" y="${i * 20 + 12}" font-size="12">${labels[i]}</text>
    `;
  }
  html += `</g>`;
  
  html += `
      </svg>
    </div>
    <style>
      .chart-container {
        font-family: sans-serif;
        margin: 20px 0;
      }
      .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
    </style>
  `;
  
  return html;
}

function generateGenericChart(data: any, type: string) {
  return `
    <div class="chart-container">
      <div class="chart-title">${type.charAt(0).toUpperCase() + type.slice(1)} Chart</div>
      <div class="chart-data">
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
      <div class="chart-message">
        Custom chart type: ${type}
      </div>
    </div>
    <style>
      .chart-container {
        font-family: sans-serif;
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .chart-data {
        background-color: #f9fafb;
        padding: 10px;
        border-radius: 4px;
        overflow: auto;
      }
      .chart-message {
        margin-top: 10px;
        color: #6b7280;
        font-style: italic;
      }
    </style>
  `;
}
