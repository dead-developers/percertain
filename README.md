# Percertain - AI Web App Builder

Percertain is a powerful DSL (Domain-Specific Language) editor that enables developers to create AI-powered web applications using FastHTML integration. It provides a simple, declarative syntax for building complex web applications with built-in AI capabilities.

## Features

- **Visual DSL Editor**: Built with Monaco Editor for a powerful coding experience
- **Real-time Preview**: See your changes instantly as you type
- **FastHTML Integration**: Automatically generates FastHTML Python code
- **AI Capabilities**: Built-in AI mods for various functionalities:
  - `code-think`: Generates code with reasoning
  - `text-think`: Processes and understands text
  - `visual-think`: Analyzes visual elements
  - `data-think`: Analyzes data patterns

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/dead-developers/percertain.git
cd percertain
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## DSL Structure

```typescript
// Define your app and description
@app "Your App Name"
@description "Your app description"

// Define data structures
@data:
  yourData: {
    type: dataType,
    properties: {...}
  }

// Define variables
@variables:
  var1: value1
  var2: value2

// Define UI components
@ui:
  layout:
    - section: header
    - section: content
    
  components:
    header:
      - heading: {text: "Title"}
      - text: {content: "Description"}

// Define actions
@actions:
  actionName:
    """
    // Your action logic here
    result = ai-mod(
      input: yourInput,
      settings: yourSettings
    )
    """

// Define AI mods
@mods:
  - code-think
  - text-think
  - visual-think
  - data-think
```

## Example Applications

1. AI Chat Interface
2. Image Generation Tool
3. Data Analysis Dashboard
4. AI-Powered Forms
5. Interactive Visualizations

## Technologies Used

- Next.js
- TypeScript
- Monaco Editor
- Tailwind CSS
- FastHTML
- AI Integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details