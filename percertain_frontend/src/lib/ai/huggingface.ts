import { HuggingFaceInferenceAPI } from './types';

class HuggingFaceClient implements HuggingFaceInferenceAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api-inference.huggingface.co/models';
  private modelCache: Record<string, string> = {};
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async query(model: string, inputs: any, options: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs,
          options
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`HuggingFace API error: ${error.error || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error querying model ${model}:`, error);
      throw error;
    }
  }
  
  async textGeneration(text: string, model: string = 'gpt2'): Promise<string> {
    try {
      const result = await this.query(model, text, {
        max_length: 150,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      });
      
      if (Array.isArray(result) && result.length > 0) {
        return result[0].generated_text;
      }
      
      return result.generated_text || JSON.stringify(result);
    } catch (error) {
      console.error('Text generation error:', error);
      return `Error generating text: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  async textClassification(text: string, model: string = 'distilbert-base-uncased-finetuned-sst-2-english'): Promise<any[]> {
    try {
      return await this.query(model, text);
    } catch (error) {
      console.error('Text classification error:', error);
      throw error;
    }
  }
  
  async questionAnswering(question: string, context: string, model: string = 'deepset/roberta-base-squad2'): Promise<any> {
    try {
      return await this.query(model, {
        question,
        context
      });
    } catch (error) {
      console.error('Question answering error:', error);
      throw error;
    }
  }
  
  async imageClassification(imageUrl: string, model: string = 'google/vit-base-patch16-224'): Promise<any[]> {
    try {
      // If the imageUrl is a base64 string, use it directly
      // Otherwise, fetch the image and convert to base64
      let imageData = imageUrl;
      
      if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      return await this.query(model, imageData);
    } catch (error) {
      console.error('Image classification error:', error);
      throw error;
    }
  }
  
  async imageGeneration(prompt: string, model: string = 'stabilityai/stable-diffusion-2'): Promise<any> {
    try {
      const result = await this.query(model, prompt);
      return result;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }
  
  async selectBestModel(task: string, inputs: any): Promise<string> {
    // Check cache first
    if (this.modelCache[task]) {
      return this.modelCache[task];
    }
    
    // Map tasks to recommended models
    const taskModelMap: Record<string, string> = {
      'text-generation': 'gpt2',
      'text-classification': 'distilbert-base-uncased-finetuned-sst-2-english',
      'question-answering': 'deepset/roberta-base-squad2',
      'image-classification': 'google/vit-base-patch16-224',
      'image-generation': 'stabilityai/stable-diffusion-2',
      'summarization': 'facebook/bart-large-cnn',
      'translation': 'Helsinki-NLP/opus-mt-en-fr',
      'fill-mask': 'bert-base-uncased',
      'token-classification': 'dbmdz/bert-large-cased-finetuned-conll03-english',
      'zero-shot-classification': 'facebook/bart-large-mnli'
    };
    
    // Get the recommended model for the task
    const model = taskModelMap[task] || 'gpt2';
    
    // Cache the result
    this.modelCache[task] = model;
    
    return model;
  }
}

// Create a singleton instance
export const huggingFaceClient = new HuggingFaceClient(process.env.HUGGINGFACE_API_KEY || '');
