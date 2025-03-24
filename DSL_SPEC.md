# Percertain DSL Specification

## Overview
Percertain DSL is a domain-specific language for creating AI-powered web applications. It compiles to FastHTML and integrates with various AI capabilities through a mod system.

## Basic Structure

```
// App declaration
title: "My AI App"
description: "An AI-powered web application"

// Data sources
data:
  userData: {source: csv}
  images: {source: folder, path: "uploads/"}

// Variables
variables:
  selectedView: "analysis"
  insightType: "detailed"

// UI components
ui:
  layout:
    - section: header
    - section: mainContent
    - section: insights

  components:
    header:
      - heading: {text: "{title}"}
      - text: {content: "{description}"}

    mainContent:
      - when: "{userData != null}"
        show:
          - chart: {
              data: "{userData}",
              type: "auto"
            }

    insights:
      - card: {
          title: "AI Analysis",
          content: "{aiInsights}"
        }

// Actions
actions:
  analyzeData:
    """
    // Use think mod to analyze data
    aiInsights = think(
      data: userData,
      depth: "comprehensive"
    )

    // Generate visualization
    chart = visualize(
      data: userData,
      insights: aiInsights
    )
    """

// Mods
mods:
  - data-think     // Reasoning about data
  - data-visual    // Data visualization
  - visual-think   // Image analysis
  - code-think     // Code generation
  - create-visual  // Image generation
```

## Syntax Rules

### 1. Section Declarations
- Sections start with their name followed by a colon
- Nested sections are indented
- Multiple sections can be defined

### 2. Variables
- Variables are declared in the `variables` section
- Referenced using curly braces: `{variableName}`
- Can contain strings, numbers, arrays, or objects

### 3. Data Binding
- Use `bind` property to connect UI elements to variables
- Data sources defined in `data` section
- Supports CSV, JSON, and folder sources

### 4. Conditional Rendering
- Use `when` blocks for conditional content
- Supports basic comparisons and logical operators
- Can be nested for complex conditions

### 5. Actions
- Defined in the `actions` section
- Can contain multiple statements
- Support async operations
- Can use mods for AI operations

### 6. Mods
- Basic mods: think, see, visualize, create, predict
- Can be combined: data-think-visual
- Auto-selects appropriate AI models
- Handles errors gracefully

## Mod System

### Basic Mods
1. **think**
   - Purpose: AI reasoning and analysis
   - Input: Any data type
   - Output: Analysis results

2. **see**
   - Purpose: Image analysis and understanding
   - Input: Image data
   - Output: Visual analysis results

3. **visualize**
   - Purpose: Data visualization
   - Input: Structured data
   - Output: Visual representation

4. **create**
   - Purpose: Content generation
   - Input: Prompts and parameters
   - Output: Generated content

5. **predict**
   - Purpose: Forecasting and prediction
   - Input: Historical data
   - Output: Predictions

### Mod Combinations
- Mods can be combined using hyphens
- Order matters: first-second-third
- Examples:
  - visual-think-code: Analyze image → Reason about it → Generate code
  - data-think-visual: Analyze data → Reason about it → Create visualization
  - create-visual-think: Generate image → Analyze it → Provide insights

## FastHTML Integration

### Component Mapping
- DSL components map directly to FastHTML components
- Maintains FastHTML's Python-like syntax
- Preserves FastHTML's AI integration capabilities

### Generated Code
- Clean and maintainable FastHTML output
- Proper error handling
- Efficient resource usage
- Automatic optimization

## Error Handling

### Syntax Errors
- Clear error messages
- Line number references
- Suggestions for fixes

### Runtime Errors
- Graceful error handling
- User-friendly error messages
- Debugging information for developers

## Best Practices

1. **Organization**
   - Group related components
   - Use meaningful variable names
   - Comment complex logic

2. **Performance**
   - Minimize unnecessary mod calls
   - Use appropriate data structures
   - Cache results when possible

3. **Security**
   - Validate user input
   - Sanitize data
   - Follow security best practices

4. **Maintainability**
   - Keep components small and focused
   - Use consistent naming conventions
   - Document complex functionality

## Examples

### Basic Data Analysis App
```
title: "Data Analyzer"
description: "Analyze CSV data with AI"

data:
  csvData: {source: csv}

variables:
  insights: null

ui:
  layout:
    - section: upload
    - section: analysis

  components:
    upload:
      - upload: {
          label: "Upload CSV",
          bind: csvData
        }

    analysis:
      - when: "{csvData != null}"
        show:
          - button: {
              text: "Analyze",
              action: analyzeData
            }
          - card: {
              content: "{insights}"
            }

actions:
  analyzeData:
    """
    insights = data-think(
      data: csvData,
      depth: "comprehensive"
    )
    """

mods:
  - data-think
```

### Image Analysis App
```
title: "Image Analyzer"
description: "Analyze images with AI"

data:
  image: {source: image}

variables:
  analysis: null

ui:
  layout:
    - section: upload
    - section: results

  components:
    upload:
      - upload: {
          label: "Upload Image",
          bind: image
        }

    results:
      - when: "{image != null}"
        show:
          - button: {
              text: "Analyze",
              action: analyzeImage
            }
          - card: {
              content: "{analysis}"
            }

actions:
  analyzeImage:
    """
    analysis = visual-think(
      image: image,
      aspects: ["objects", "text", "sentiment"]
    )
    """

mods:
  - visual-think