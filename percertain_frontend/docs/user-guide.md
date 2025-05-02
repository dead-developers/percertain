# Percertain Documentation

## Introduction

Welcome to Percertain, a powerful platform for creating AI-powered web applications using a simple, intuitive Domain Specific Language (DSL). Percertain combines the ease of use of perchance.org with the AI capabilities of Hugging Face, allowing you to create sophisticated web applications without extensive coding knowledge.

This documentation will guide you through the process of creating, editing, and deploying your own AI web applications using Percertain.

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Percertain DSL](#the-percertain-dsl)
3. [Working with the Editor](#working-with-the-editor)
4. [Using AI Mods](#using-ai-mods)
5. [Sharing and Collaboration](#sharing-and-collaboration)
6. [Deployment](#deployment)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Creating an Account

To get started with Percertain, you'll need to create an account:

1. Visit [percertain.com](https://percertain.com)
2. Click on "Sign Up" in the top-right corner
3. Fill in your details or sign up with Google or GitHub
4. Verify your email address

### Creating Your First Project

Once you've created an account, you can create your first project:

1. Navigate to the "Projects" page
2. Click on "New Project"
3. Enter a name and description for your project
4. Choose whether to make your project public or private
5. Click "Create Project"

You'll be redirected to the project editor where you can start building your application.

## The Percertain DSL

The Percertain Domain Specific Language (DSL) is designed to be intuitive and easy to learn, while still providing powerful capabilities for creating AI-powered web applications.

### Basic Structure

A Percertain DSL file consists of several sections, each with a specific purpose:

```
@app "My First App"
@description "A simple example application"

@variables:
  title = "Welcome to my app"
  counter = "0"

@ui:
  layout:
    - section: header
    - section: main
    - section: footer
  
  components:
    header:
      - heading: {text: "{title}"}
    
    main:
      - text: {content: "This is my first Percertain app!"}
      - button: {label: "Click me", onClick: "incrementCounter"}
    
    footer:
      - text: {content: "Created with Percertain"}

@actions:
  incrementCounter:
    - set: {counter: "{counter + 1}"}
    - set: {title: "Clicked {counter} times"}

@mods:
  - data-think
  - visual-create
```

### Sections

#### @app and @description

These define the basic metadata for your application:

```
@app "My App Name"
@description "A brief description of what my app does"
```

#### @variables

Variables store data that can be used throughout your application:

```
@variables:
  name = "John"
  age = "30"
  items = ["apple", "banana", "orange"]
```

You can reference variables in other parts of your DSL using curly braces: `{variableName}`.

#### @ui

The UI section defines the layout and components of your application:

```
@ui:
  layout:
    - section: header
    - section: main
  
  components:
    header:
      - heading: {text: "My App"}
    
    main:
      - text: {content: "Hello, {name}!"}
      - button: {label: "Click me", onClick: "handleClick"}
```

#### @actions

Actions define the behavior of your application in response to user interactions:

```
@actions:
  handleClick:
    - set: {message: "Button was clicked!"}
    - mod: {type: "data-think", input: "Generate a greeting", output: "greeting"}
```

#### @mods

Mods are AI-powered modules that add capabilities to your application:

```
@mods:
  - data-think
  - visual-create
  - code-think
```

## Working with the Editor

The Percertain editor is divided into three panes:

1. **Editor Pane**: Where you write your DSL code
2. **Preview Pane**: Shows a live preview of your application
3. **Output Pane**: Displays the generated FastHTML Python code

### Editor Features

- **Syntax Highlighting**: The editor highlights different parts of your DSL for better readability
- **Error Checking**: Errors in your DSL are highlighted in real-time
- **Auto-completion**: The editor suggests completions as you type
- **Version History**: You can save versions of your project and revert to them later

### Keyboard Shortcuts

- **Ctrl+S**: Save your project
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Ctrl+F**: Find
- **Ctrl+H**: Replace
- **Ctrl+/**: Toggle comment

## Using AI Mods

AI Mods are the heart of Percertain's power. They allow you to integrate AI capabilities into your applications without having to write complex code.

### Available Mods

#### data-think

Analyzes data and generates insights or text based on the input.

```
@actions:
  generateInsight:
    - mod: {type: "data-think", input: "{userData}", output: "insight"}
    - set: {insightText: "{insight}"}
```

#### data-visual

Generates visualizations from data.

```
@actions:
  createChart:
    - mod: {type: "data-visual", input: "{salesData}", output: "chart"}
    - set: {chartImage: "{chart}"}
```

#### visual-think

Analyzes images and generates insights or descriptions.

```
@actions:
  analyzeImage:
    - mod: {type: "visual-think", input: "{uploadedImage}", output: "imageAnalysis"}
    - set: {analysisText: "{imageAnalysis}"}
```

#### visual-create

Generates images based on text descriptions.

```
@actions:
  generateImage:
    - mod: {type: "visual-create", input: "A beautiful sunset over mountains", output: "generatedImage"}
    - set: {displayImage: "{generatedImage}"}
```

#### code-think

Analyzes code and provides insights or suggestions.

```
@actions:
  analyzeCode:
    - mod: {type: "code-think", input: "{userCode}", output: "codeAnalysis"}
    - set: {analysisText: "{codeAnalysis}"}
```

#### code-create

Generates code based on natural language descriptions.

```
@actions:
  generateCode:
    - mod: {type: "code-create", input: "Create a function that calculates the factorial of a number", output: "generatedCode"}
    - set: {codeSnippet: "{generatedCode}"}
```

### Combining Mods

Mods can be combined to create more complex workflows:

```
@actions:
  analyzeAndVisualize:
    - mod: {type: "data-think", input: "{userData}", output: "analysis"}
    - mod: {type: "data-visual", input: "{analysis}", output: "visualization"}
    - set: {result: "{visualization}"}
```

## Sharing and Collaboration

Percertain makes it easy to share your projects and collaborate with others.

### Making Projects Public

By default, projects are private and only visible to you. To make a project public:

1. Go to your project's settings
2. Toggle the "Public" switch to ON
3. Click "Save Changes"

Public projects will appear in the gallery where other users can view and favorite them.

### Sharing with Specific Users

You can share your projects with specific users, even if they're not public:

1. Go to your project's settings
2. Click on the "Sharing" tab
3. Enter the email address of the user you want to share with
4. Select the permission level (View or Edit)
5. Click "Share"

### Collaboration Features

When collaborating on a project:

- All collaborators with Edit permissions can make changes to the project
- The project owner can see a history of all changes
- Version history allows you to revert to previous versions if needed

## Deployment

Percertain allows you to deploy your applications to production with just a few clicks.

### Deploying Your Application

To deploy your application:

1. Go to your project page
2. Click on the "Deploy" tab
3. Click "Deploy to Production"
4. Wait for the deployment to complete
5. Once deployed, you'll receive a unique URL for your application

### Deployment Options

- **Production**: Deploy to a permanent URL that you can share with others
- **Preview**: Deploy to a temporary URL for testing

### Viewing Deployment History

You can view the history of all deployments for your project:

1. Go to your project page
2. Click on the "Deploy" tab
3. Scroll down to see the deployment history

## Examples

Here are some example projects to help you get started with Percertain:

### Simple Text Generator

```
@app "Text Generator"
@description "Generates text based on a prompt"

@variables:
  prompt = "Write a short story about"
  topic = "a space adventure"
  generatedText = ""

@ui:
  layout:
    - section: header
    - section: main
    - section: output
  
  components:
    header:
      - heading: {text: "AI Text Generator"}
    
    main:
      - text: {content: "Enter a topic:"}
      - input: {value: "{topic}", onChange: "updateTopic"}
      - button: {label: "Generate", onClick: "generateText"}
    
    output:
      - text: {content: "{generatedText}"}

@actions:
  updateTopic:
    - set: {topic: "{event.value}"}
  
  generateText:
    - mod: {type: "data-think", input: "{prompt} {topic}", output: "result"}
    - set: {generatedText: "{result}"}

@mods:
  - data-think
```

### Image Generator

```
@app "Image Generator"
@description "Generates images based on text descriptions"

@variables:
  description = "A futuristic city with flying cars"
  generatedImage = ""

@ui:
  layout:
    - section: header
    - section: main
    - section: output
  
  components:
    header:
      - heading: {text: "AI Image Generator"}
    
    main:
      - text: {content: "Describe the image you want to generate:"}
      - textarea: {value: "{description}", onChange: "updateDescription"}
      - button: {label: "Generate Image", onClick: "generateImage"}
    
    output:
      - image: {src: "{generatedImage}"}

@actions:
  updateDescription:
    - set: {description: "{event.value}"}
  
  generateImage:
    - mod: {type: "visual-create", input: "{description}", output: "result"}
    - set: {generatedImage: "{result}"}

@mods:
  - visual-create
```

### Data Analyzer

```
@app "Data Analyzer"
@description "Analyzes data and generates insights"

@variables:
  data = "Year,Sales\n2020,100\n2021,150\n2022,200\n2023,250"
  analysis = ""
  chart = ""

@ui:
  layout:
    - section: header
    - section: input
    - section: output
  
  components:
    header:
      - heading: {text: "Data Analyzer"}
    
    input:
      - text: {content: "Enter your data (CSV format):"}
      - textarea: {value: "{data}", onChange: "updateData"}
      - button: {label: "Analyze", onClick: "analyzeData"}
    
    output:
      - text: {content: "Analysis:"}
      - text: {content: "{analysis}"}
      - image: {src: "{chart}"}

@actions:
  updateData:
    - set: {data: "{event.value}"}
  
  analyzeData:
    - mod: {type: "data-think", input: "Analyze this data: {data}", output: "analysisResult"}
    - set: {analysis: "{analysisResult}"}
    - mod: {type: "data-visual", input: "{data}", output: "chartResult"}
    - set: {chart: "{chartResult}"}

@mods:
  - data-think
  - data-visual
```

## Troubleshooting

### Common Errors

#### Syntax Errors

If you see syntax errors in your DSL, check for:

- Missing quotes around string values
- Missing colons after section names
- Incorrect indentation
- Unmatched curly braces

#### Mod Errors

If you're having issues with mods:

- Make sure the mod is included in the `@mods` section
- Check that the input data is in the correct format
- Verify that the output variable is correctly referenced

#### Deployment Errors

If you're having issues with deployment:

- Make sure your DSL compiles without errors
- Check that you have the necessary permissions
- Verify that your project doesn't exceed size limits

### Getting Help

If you're still having issues:

- Check the [FAQ](https://percertain.com/faq)
- Visit the [Community Forum](https://percertain.com/forum)
- Contact support at support@percertain.com
