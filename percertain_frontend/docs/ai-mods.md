# AI Mods Reference

This document provides a comprehensive reference for the AI Mods available in Percertain, including their capabilities, parameters, and usage examples.

## Introduction to Mods

Mods are AI-powered modules that add capabilities to your Percertain applications. They allow you to integrate sophisticated AI features without having to write complex code or manage AI infrastructure.

Each mod follows a naming convention that describes its input and output types:
- **Prefix**: Describes the input type (data-, visual-, code-, etc.)
- **Suffix**: Describes the output type or action (-think, -visual, -code, etc.)

## Available Mods

### data-think

Analyzes data and generates insights or text based on the input.

**Parameters:**
- `input`: The data to analyze (text, JSON, CSV, etc.)
- `model` (optional): The specific model to use for analysis
- `options` (optional): Additional options for the analysis

**Example:**
```
@actions:
  analyzeData:
    - mod: {
        type: "data-think",
        input: "{salesData}",
        output: "analysis"
      }
    - set: {analysisResult: "{analysis}"}
```

**Use Cases:**
- Summarizing large text documents
- Answering questions about data
- Generating insights from structured data
- Creating natural language descriptions of data
- Sentiment analysis of text

### data-visual

Generates visualizations from data.

**Parameters:**
- `input`: The data to visualize (JSON, CSV, etc.)
- `type` (optional): The type of visualization (bar, line, pie, scatter, etc.)
- `options` (optional): Additional options for the visualization

**Example:**
```
@actions:
  visualizeData:
    - mod: {
        type: "data-visual",
        input: "{salesData}",
        options: {
          type: "bar",
          xAxis: "month",
          yAxis: "revenue"
        },
        output: "chart"
      }
    - set: {chartImage: "{chart}"}
```

**Use Cases:**
- Creating charts and graphs from data
- Generating heatmaps
- Visualizing trends over time
- Comparing different data sets
- Creating interactive data dashboards

### visual-think

Analyzes images and generates insights or descriptions.

**Parameters:**
- `input`: The image to analyze (URL or base64-encoded image)
- `task` (optional): The specific analysis task (describe, classify, detect, etc.)
- `options` (optional): Additional options for the analysis

**Example:**
```
@actions:
  analyzeImage:
    - mod: {
        type: "visual-think",
        input: "{uploadedImage}",
        task: "describe",
        output: "description"
      }
    - set: {imageDescription: "{description}"}
```

**Use Cases:**
- Generating descriptions of images
- Classifying images into categories
- Detecting objects in images
- Analyzing facial expressions
- Extracting text from images (OCR)

### visual-create

Generates images based on text descriptions.

**Parameters:**
- `input`: The text description of the image to generate
- `style` (optional): The style of the image (realistic, cartoon, sketch, etc.)
- `size` (optional): The size of the image (width x height)
- `options` (optional): Additional options for image generation

**Example:**
```
@actions:
  generateImage:
    - mod: {
        type: "visual-create",
        input: "A futuristic city with flying cars and tall skyscrapers",
        style: "realistic",
        size: "512x512",
        output: "image"
      }
    - set: {generatedImage: "{image}"}
```

**Use Cases:**
- Creating illustrations for content
- Generating product mockups
- Creating avatars or profile pictures
- Visualizing concepts or ideas
- Creating art based on text descriptions

### code-think

Analyzes code and provides insights or suggestions.

**Parameters:**
- `input`: The code to analyze
- `language` (optional): The programming language of the code
- `task` (optional): The specific analysis task (review, explain, optimize, etc.)
- `options` (optional): Additional options for the analysis

**Example:**
```
@actions:
  analyzeCode:
    - mod: {
        type: "code-think",
        input: "{userCode}",
        language: "javascript",
        task: "review",
        output: "review"
      }
    - set: {codeReview: "{review}"}
```

**Use Cases:**
- Code review and suggestions
- Explaining complex code
- Identifying bugs or security issues
- Optimizing code for performance
- Documenting code functionality

### code-create

Generates code based on natural language descriptions.

**Parameters:**
- `input`: The description of the code to generate
- `language`: The programming language to generate
- `options` (optional): Additional options for code generation

**Example:**
```
@actions:
  generateCode:
    - mod: {
        type: "code-create",
        input: "Create a function that calculates the factorial of a number",
        language: "python",
        output: "code"
      }
    - set: {generatedCode: "{code}"}
```

**Use Cases:**
- Generating boilerplate code
- Creating functions based on descriptions
- Implementing algorithms
- Converting code between languages
- Creating API integrations

## Combining Mods

One of the powerful features of Percertain is the ability to chain mods together to create more complex workflows.

**Example: Data Analysis and Visualization**
```
@actions:
  analyzeAndVisualize:
    - mod: {
        type: "data-think",
        input: "{salesData}",
        output: "analysis"
      }
    - mod: {
        type: "data-visual",
        input: "{analysis.data}",
        options: {
          type: "bar",
          title: "{analysis.title}"
        },
        output: "chart"
      }
    - set: {
        analysisText: "{analysis.summary}",
        chartImage: "{chart}"
      }
```

**Example: Image Generation and Analysis**
```
@actions:
  generateAndAnalyze:
    - mod: {
        type: "visual-create",
        input: "{imagePrompt}",
        output: "image"
      }
    - mod: {
        type: "visual-think",
        input: "{image}",
        task: "describe",
        output: "description"
      }
    - set: {
        generatedImage: "{image}",
        imageDescription: "{description}"
      }
```

## Best Practices

1. **Provide Clear Inputs**: The more specific and clear your inputs are, the better the results will be.

2. **Handle Errors**: Always include error handling when using mods, as AI models can sometimes produce unexpected results.

3. **Cache Results**: For expensive operations, consider caching results to improve performance.

4. **Use Appropriate Models**: Different tasks may require different models. Use the most appropriate model for your specific use case.

5. **Respect Rate Limits**: Be mindful of rate limits when making multiple mod calls in quick succession.

6. **Test Thoroughly**: Test your mods with a variety of inputs to ensure they work as expected in all scenarios.

7. **Provide Feedback**: Allow users to provide feedback on mod results to improve the system over time.

## Advanced Usage

### Custom Model Selection

You can specify a particular model to use for a mod:

```
@actions:
  generateText:
    - mod: {
        type: "data-think",
        input: "{prompt}",
        model: "gpt-4",
        output: "text"
      }
```

### Streaming Results

For long-running operations, you can stream results:

```
@actions:
  generateLongText:
    - mod: {
        type: "data-think",
        input: "{prompt}",
        stream: true,
        onChunk: "handleTextChunk",
        output: "text"
      }
```

### Advanced Options

Each mod supports various advanced options:

```
@actions:
  generateImage:
    - mod: {
        type: "visual-create",
        input: "{prompt}",
        options: {
          style: "realistic",
          size: "1024x1024",
          seed: 12345,
          guidance_scale: 7.5
        },
        output: "image"
      }
```

## Troubleshooting

### Common Issues

1. **Unclear Results**: If you're getting unclear or irrelevant results, try being more specific in your input.

2. **Rate Limiting**: If you're hitting rate limits, try implementing caching or reducing the frequency of mod calls.

3. **Model Errors**: If a specific model is causing errors, try using a different model or the default model.

4. **Large Inputs**: If your input is very large, try breaking it down into smaller chunks.

### Getting Help

If you're having issues with mods:

- Check the [FAQ](https://percertain.com/faq)
- Visit the [Community Forum](https://percertain.com/forum)
- Contact support at support@percertain.com
