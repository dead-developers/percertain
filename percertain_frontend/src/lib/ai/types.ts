export interface HuggingFaceInferenceAPI {
  query(model: string, inputs: any, options?: any): Promise<any>;
  textGeneration(text: string, model?: string): Promise<string>;
  textClassification(text: string, model?: string): Promise<any[]>;
  questionAnswering(question: string, context: string, model?: string): Promise<any>;
  imageClassification(imageUrl: string, model?: string): Promise<any[]>;
  imageGeneration(prompt: string, model?: string): Promise<any>;
  selectBestModel(task: string, inputs: any): Promise<string>;
}
