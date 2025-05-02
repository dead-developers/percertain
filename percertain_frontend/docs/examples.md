# Example Projects

This document provides a collection of example projects to help you get started with Percertain. Each example demonstrates different features and capabilities of the platform.

## 1. Simple Counter

A basic counter application that demonstrates fundamental concepts like variables, UI components, and actions.

```
@app "Simple Counter"
@description "A basic counter application"

@variables:
  count = "0"

@ui:
  layout:
    - section: header
    - section: main
  
  components:
    header:
      - heading: {text: "Simple Counter"}
    
    main:
      - text: {content: "Current count: {count}"}
      - container: {className: "button-group", children: [
          - button: {label: "Increment", onClick: "increment"}
          - button: {label: "Decrement", onClick: "decrement"}
          - button: {label: "Reset", onClick: "reset"}
        ]}

@actions:
  increment:
    - set: {count: "{parseInt(count) + 1}"}
  
  decrement:
    - set: {count: "{Math.max(0, parseInt(count) - 1)}"}
  
  reset:
    - set: {count: "0"}
```

## 2. Todo List

A todo list application that demonstrates working with lists, conditional rendering, and more complex state management.

```
@app "Todo List"
@description "A simple todo list application"

@variables:
  todos = []
  newTodo = ""

@ui:
  layout:
    - section: header
    - section: input
    - section: list
  
  components:
    header:
      - heading: {text: "Todo List"}
    
    input:
      - container: {className: "input-group", children: [
          - input: {value: "{newTodo}", onChange: "updateNewTodo", placeholder: "Add a new todo"}
          - button: {label: "Add", onClick: "addTodo"}
        ]}
    
    list:
      - if: {condition: "{todos.length === 0}", then: [
          - text: {content: "No todos yet. Add one above!"}
        ], else: [
          - forEach: {items: "{todos}", as: "todo", index: "i", do: [
              - container: {className: "todo-item", children: [
                  - checkbox: {checked: "{todo.completed}", onChange: "toggleTodo", params: {index: "{i}"}}
                  - text: {content: "{todo.text}", className: "{todo.completed ? 'completed' : ''}"}
                  - button: {label: "Delete", onClick: "deleteTodo", params: {index: "{i}"}}
                ]}
            ]}
        ]}

@actions:
  updateNewTodo:
    - set: {newTodo: "{event.value}"}
  
  addTodo:
    - if: {condition: "{newTodo.trim() !== ''}", then: [
        - set: {todos: "{[...todos, {text: newTodo, completed: false}]}"}
        - set: {newTodo: ""}
      ]}
  
  toggleTodo:
    - set: {todos: "{todos.map((t, i) => i == event.params.index ? {...t, completed: !t.completed} : t)}"}
  
  deleteTodo:
    - set: {todos: "{todos.filter((t, i) => i != event.params.index)}"}
```

## 3. AI Text Generator

A text generation application that demonstrates using the data-think mod to generate text based on prompts.

```
@app "AI Text Generator"
@description "Generate text using AI"

@variables:
  prompt = "Write a short story about"
  topic = "a space adventure"
  generatedText = ""
  isGenerating = "false"

@ui:
  layout:
    - section: header
    - section: input
    - section: output
  
  components:
    header:
      - heading: {text: "AI Text Generator"}
    
    input:
      - text: {content: "Enter a topic:"}
      - input: {value: "{topic}", onChange: "updateTopic", placeholder: "e.g., a space adventure"}
      - button: {label: "{isGenerating ? 'Generating...' : 'Generate Text'}", onClick: "generateText", disabled: "{isGenerating}"}
    
    output:
      - if: {condition: "{generatedText !== ''}", then: [
          - heading: {text: "Generated Text:"}
          - container: {className: "generated-text", children: [
              - text: {content: "{generatedText}"}
            ]}
        ]}

@actions:
  updateTopic:
    - set: {topic: "{event.value}"}
  
  generateText:
    - set: {isGenerating: "true"}
    - mod: {
        type: "data-think",
        input: "{prompt} {topic}",
        output: "result"
      }
    - set: {generatedText: "{result}"}
    - set: {isGenerating: "false"}

@mods:
  - data-think
```

## 4. AI Image Generator

An image generation application that demonstrates using the visual-create mod to generate images based on text descriptions.

```
@app "AI Image Generator"
@description "Generate images using AI"

@variables:
  prompt = ""
  generatedImage = ""
  isGenerating = "false"
  error = ""

@ui:
  layout:
    - section: header
    - section: input
    - section: output
  
  components:
    header:
      - heading: {text: "AI Image Generator"}
    
    input:
      - text: {content: "Describe the image you want to generate:"}
      - textarea: {value: "{prompt}", onChange: "updatePrompt", placeholder: "e.g., A futuristic city with flying cars and tall skyscrapers"}
      - button: {label: "{isGenerating ? 'Generating...' : 'Generate Image'}", onClick: "generateImage", disabled: "{isGenerating || prompt.trim() === ''}"}
    
    output:
      - if: {condition: "{error !== ''}", then: [
          - container: {className: "error-message", children: [
              - text: {content: "Error: {error}"}
            ]}
        ]}
      - if: {condition: "{generatedImage !== ''}", then: [
          - heading: {text: "Generated Image:"}
          - image: {src: "{generatedImage}", alt: "Generated image based on the prompt"}
          - button: {label: "Download", onClick: "downloadImage"}
        ]}

@actions:
  updatePrompt:
    - set: {prompt: "{event.value}"}
  
  generateImage:
    - set: {isGenerating: "true"}
    - set: {error: ""}
    - mod: {
        type: "visual-create",
        input: "{prompt}",
        output: "result",
        onSuccess: "handleImageSuccess",
        onError: "handleImageError"
      }
  
  handleImageSuccess:
    - set: {generatedImage: "{result}"}
    - set: {isGenerating: "false"}
  
  handleImageError:
    - set: {error: "{result}"}
    - set: {isGenerating: "false"}
  
  downloadImage:
    - if: {condition: "{generatedImage !== ''}", then: [
        - download: {url: "{generatedImage}", filename: "generated-image.png"}
      ]}

@mods:
  - visual-create
```

## 5. Data Visualization Dashboard

A data visualization application that demonstrates using the data-visual mod to create charts and graphs from data.

```
@app "Data Visualization Dashboard"
@description "Visualize data using AI-powered charts"

@variables:
  data = "Month,Sales,Expenses\nJan,1000,700\nFeb,1200,750\nMar,1500,800\nApr,1300,850\nMay,1700,900\nJun,2000,950"
  chartType = "bar"
  chartOptions = {
    title: "Sales and Expenses",
    xAxis: "Month",
    yAxis: "Amount"
  }
  chart = ""
  isGenerating = "false"

@ui:
  layout:
    - section: header
    - section: controls
    - section: data
    - section: visualization
  
  components:
    header:
      - heading: {text: "Data Visualization Dashboard"}
    
    controls:
      - text: {content: "Chart Type:"}
      - select: {
          options: ["bar", "line", "pie", "scatter"],
          value: "{chartType}",
          onChange: "updateChartType"
        }
      - button: {label: "{isGenerating ? 'Generating...' : 'Generate Chart'}", onClick: "generateChart", disabled: "{isGenerating}"}
    
    data:
      - text: {content: "Enter your data (CSV format):"}
      - textarea: {value: "{data}", onChange: "updateData", rows: "8"}
    
    visualization:
      - if: {condition: "{chart !== ''}", then: [
          - heading: {text: "Generated Chart:"}
          - image: {src: "{chart}", alt: "Generated chart based on the data"}
        ]}

@actions:
  updateChartType:
    - set: {chartType: "{event.value}"}
  
  updateData:
    - set: {data: "{event.value}"}
  
  generateChart:
    - set: {isGenerating: "true"}
    - mod: {
        type: "data-visual",
        input: "{data}",
        options: {
          type: "{chartType}",
          title: "{chartOptions.title}",
          xAxis: "{chartOptions.xAxis}",
          yAxis: "{chartOptions.yAxis}"
        },
        output: "result"
      }
    - set: {chart: "{result}"}
    - set: {isGenerating: "false"}

@mods:
  - data-visual
```

## 6. Code Generator

A code generation application that demonstrates using the code-create mod to generate code based on natural language descriptions.

```
@app "Code Generator"
@description "Generate code using AI"

@variables:
  prompt = ""
  language = "javascript"
  generatedCode = ""
  isGenerating = "false"

@ui:
  layout:
    - section: header
    - section: input
    - section: output
  
  components:
    header:
      - heading: {text: "AI Code Generator"}
    
    input:
      - text: {content: "Describe the code you want to generate:"}
      - textarea: {value: "{prompt}", onChange: "updatePrompt", placeholder: "e.g., Create a function that calculates the factorial of a number"}
      - text: {content: "Language:"}
      - select: {
          options: ["javascript", "python", "java", "c++", "ruby", "go"],
          value: "{language}",
          onChange: "updateLanguage"
        }
      - button: {label: "{isGenerating ? 'Generating...' : 'Generate Code'}", onClick: "generateCode", disabled: "{isGenerating || prompt.trim() === ''}"}
    
    output:
      - if: {condition: "{generatedCode !== ''}", then: [
          - heading: {text: "Generated Code:"}
          - container: {className: "code-block", children: [
              - code: {content: "{generatedCode}", language: "{language}"}
            ]}
          - button: {label: "Copy to Clipboard", onClick: "copyCode"}
        ]}

@actions:
  updatePrompt:
    - set: {prompt: "{event.value}"}
  
  updateLanguage:
    - set: {language: "{event.value}"}
  
  generateCode:
    - set: {isGenerating: "true"}
    - mod: {
        type: "code-create",
        input: "{prompt}",
        language: "{language}",
        output: "result"
      }
    - set: {generatedCode: "{result}"}
    - set: {isGenerating: "false"}
  
  copyCode:
    - clipboard: {text: "{generatedCode}"}
    - alert: {message: "Code copied to clipboard!"}

@mods:
  - code-create
```

## 7. AI Chatbot

A chatbot application that demonstrates using the data-think mod to create a conversational interface.

```
@app "AI Chatbot"
@description "Chat with an AI assistant"

@variables:
  messages = []
  newMessage = ""
  isTyping = "false"

@ui:
  layout:
    - section: header
    - section: chat
    - section: input
  
  components:
    header:
      - heading: {text: "AI Chatbot"}
    
    chat:
      - container: {className: "chat-container", children: [
          - if: {condition: "{messages.length === 0}", then: [
              - text: {content: "Start chatting with the AI assistant!"}
            ], else: [
              - forEach: {items: "{messages}", as: "message", do: [
                  - container: {
                      className: "message {message.sender === 'user' ? 'user-message' : 'ai-message'}",
                      children: [
                        - text: {content: "{message.text}"}
                      ]
                    }
                ]}
            ]}
          - if: {condition: "{isTyping === 'true'}", then: [
              - container: {className: "typing-indicator", children: [
                  - text: {content: "AI is typing..."}
                ]}
            ]}
        ]}
    
    input:
      - container: {className: "input-group", children: [
          - input: {
              value: "{newMessage}",
              onChange: "updateNewMessage",
              placeholder: "Type your message...",
              onKeyPress: "handleKeyPress"
            }
          - button: {
              label: "Send",
              onClick: "sendMessage",
              disabled: "{isTyping === 'true' || newMessage.trim() === ''}"
            }
        ]}

@actions:
  updateNewMessage:
    - set: {newMessage: "{event.value}"}
  
  handleKeyPress:
    - if: {condition: "{event.key === 'Enter' && newMessage.trim() !== '' && isTyping !== 'true'}", then: [
        - action: "sendMessage"
      ]}
  
  sendMessage:
    - set: {
        messages: "{[...messages, {sender: 'user', text: newMessage}]}",
        newMessage: "",
        isTyping: "true"
      }
    - mod: {
        type: "data-think",
        input: "You are a helpful AI assistant. Respond to this message: {newMessage}",
        output: "response"
      }
    - set: {
        messages: "{[...messages, {sender: 'user', text: newMessage}, {sender: 'ai', text: response}]}",
        isTyping: "false"
      }

@mods:
  - data-think
```

## 8. Image Analyzer

An image analysis application that demonstrates using the visual-think mod to analyze and describe images.

```
@app "Image Analyzer"
@description "Analyze images using AI"

@variables:
  imageUrl = ""
  analysis = ""
  isAnalyzing = "false"

@ui:
  layout:
    - section: header
    - section: input
    - section: output
  
  components:
    header:
      - heading: {text: "AI Image Analyzer"}
    
    input:
      - text: {content: "Enter an image URL or upload an image:"}
      - input: {value: "{imageUrl}", onChange: "updateImageUrl", placeholder: "https://example.com/image.jpg"}
      - fileUpload: {accept: "image/*", onChange: "handleImageUpload"}
      - button: {label: "{isAnalyzing ? 'Analyzing...' : 'Analyze Image'}", onClick: "analyzeImage", disabled: "{isAnalyzing || imageUrl === ''}"}
    
    output:
      - if: {condition: "{imageUrl !== ''}", then: [
          - heading: {text: "Image:"}
          - image: {src: "{imageUrl}", alt: "Image to analyze"}
        ]}
      - if: {condition: "{analysis !== ''}", then: [
          - heading: {text: "Analysis:"}
          - container: {className: "analysis-result", children: [
              - text: {content: "{analysis}"}
            ]}
        ]}

@actions:
  updateImageUrl:
    - set: {imageUrl: "{event.value}"}
  
  handleImageUpload:
    - set: {imageUrl: "{event.dataUrl}"}
  
  analyzeImage:
    - set: {isAnalyzing: "true"}
    - mod: {
        type: "visual-think",
        input: "{imageUrl}",
        output: "result"
      }
    - set: {analysis: "{result}"}
    - set: {isAnalyzing: "false"}

@mods:
  - visual-think
```

These examples demonstrate various features and capabilities of Percertain. You can use them as starting points for your own projects or as references when learning how to use the platform.
