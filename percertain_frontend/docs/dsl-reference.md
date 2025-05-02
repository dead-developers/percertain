# Percertain DSL Reference

This document provides a comprehensive reference for the Percertain Domain Specific Language (DSL), including all available sections, components, and syntax.

## DSL Structure

A Percertain DSL file is structured into several sections, each with a specific purpose:

```
@app "App Name"
@description "App Description"

@variables:
  // Variable definitions

@ui:
  layout:
    // Layout definitions
  
  components:
    // Component definitions

@actions:
  // Action definitions

@mods:
  // Mod declarations
```

## Sections

### @app

Defines the name of your application.

**Syntax:**
```
@app "Your App Name"
```

### @description

Provides a description of your application.

**Syntax:**
```
@description "A description of what your app does"
```

### @variables

Defines variables that can be used throughout your application.

**Syntax:**
```
@variables:
  variableName = "value"
  numberVar = "42"
  boolVar = "true"
  listVar = ["item1", "item2", "item3"]
  objectVar = {key1: "value1", key2: "value2"}
```

**Accessing Variables:**
Variables can be accessed in other parts of the DSL using curly braces:
```
{variableName}
```

### @ui

Defines the user interface of your application, including layout and components.

#### Layout

The layout section defines the structure of your UI.

**Syntax:**
```
layout:
  - section: sectionName
  - section: anotherSection
```

#### Components

The components section defines the UI elements for each section in your layout.

**Syntax:**
```
components:
  sectionName:
    - componentType: {prop1: "value1", prop2: "value2"}
```

**Available Components:**

- **heading**: Displays a heading
  ```
  - heading: {text: "Heading Text"}
  ```

- **text**: Displays text content
  ```
  - text: {content: "Text content goes here"}
  ```

- **button**: Creates a clickable button
  ```
  - button: {label: "Click Me", onClick: "actionName"}
  ```

- **input**: Creates a text input field
  ```
  - input: {value: "{variableName}", onChange: "actionName"}
  ```

- **textarea**: Creates a multi-line text input
  ```
  - textarea: {value: "{variableName}", onChange: "actionName"}
  ```

- **select**: Creates a dropdown selection
  ```
  - select: {
      options: ["Option 1", "Option 2", "Option 3"],
      value: "{selectedOption}",
      onChange: "actionName"
    }
  ```

- **checkbox**: Creates a checkbox
  ```
  - checkbox: {
      label: "Check me",
      checked: "{isChecked}",
      onChange: "actionName"
    }
  ```

- **image**: Displays an image
  ```
  - image: {src: "{imageUrl}", alt: "Image description"}
  ```

- **list**: Displays a list of items
  ```
  - list: {
      items: "{listVariable}",
      renderItem: "itemTemplate"
    }
  ```

- **card**: Creates a card container
  ```
  - card: {
      title: "Card Title",
      content: [
        - text: {content: "Card content"}
        - button: {label: "Card Button", onClick: "actionName"}
      ]
    }
  ```

- **container**: Creates a generic container
  ```
  - container: {
      className: "custom-container",
      children: [
        - text: {content: "Container content"}
      ]
    }
  ```

### @actions

Defines actions that can be triggered by user interactions.

**Syntax:**
```
@actions:
  actionName:
    - operation: {param1: "value1", param2: "value2"}
```

**Available Operations:**

- **set**: Sets a variable value
  ```
  - set: {variableName: "new value"}
  ```

- **mod**: Executes an AI mod
  ```
  - mod: {type: "data-think", input: "{inputData}", output: "resultVariable"}
  ```

- **if**: Conditional execution
  ```
  - if: {condition: "{variable == 'value'}", then: [
      - set: {result: "condition is true"}
    ], else: [
      - set: {result: "condition is false"}
    ]}
  ```

- **forEach**: Iterates over a list
  ```
  - forEach: {items: "{listVariable}", as: "item", do: [
      - set: {processedItem: "{item + ' processed'}"}
    ]}
  ```

- **fetch**: Fetches data from an API
  ```
  - fetch: {
      url: "https://api.example.com/data",
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: "{requestBody}",
      onSuccess: "handleSuccess",
      onError: "handleError"
    }
  ```

- **navigate**: Navigates to another page
  ```
  - navigate: {to: "/another-page"}
  ```

- **alert**: Shows an alert message
  ```
  - alert: {message: "This is an alert message"}
  ```

### @mods

Declares the AI mods used in your application.

**Syntax:**
```
@mods:
  - modName
  - anotherMod
```

**Available Mods:**

- **data-think**: Analyzes data and generates insights or text
- **data-visual**: Generates visualizations from data
- **visual-think**: Analyzes images and generates insights
- **visual-create**: Generates images from text descriptions
- **code-think**: Analyzes code and provides insights
- **code-create**: Generates code from natural language descriptions

## Advanced Features

### Variable Expressions

You can use expressions in variable references:

```
{count + 1}
{firstName + " " + lastName}
{isActive ? "Yes" : "No"}
```

### Conditional Rendering

You can conditionally render components:

```
- if: {condition: "{isLoggedIn}", then: [
    - text: {content: "Welcome back, {username}!"}
  ], else: [
    - text: {content: "Please log in"}
    - button: {label: "Log In", onClick: "login"}
  ]}
```

### List Rendering

You can render lists of components:

```
- forEach: {items: "{users}", as: "user", do: [
    - card: {
        title: "{user.name}",
        content: [
          - text: {content: "{user.email}"}
          - button: {label: "View Profile", onClick: "viewProfile", params: {userId: "{user.id}"}}
        ]
      }
  ]}
```

### Event Parameters

You can pass parameters to actions:

```
- button: {label: "Delete", onClick: "deleteItem", params: {itemId: "{item.id}"}}
```

And access them in the action:

```
@actions:
  deleteItem:
    - set: {itemToDelete: "{event.params.itemId}"}
    - fetch: {url: "/api/items/{event.params.itemId}", method: "DELETE"}
```

## Best Practices

1. **Organize your code**: Keep related variables, components, and actions together
2. **Use meaningful names**: Choose descriptive names for variables, actions, and sections
3. **Break down complex UIs**: Use multiple sections to organize your UI
4. **Reuse components**: Create reusable components for common patterns
5. **Handle errors**: Always include error handling in your actions
6. **Test thoroughly**: Test your application with different inputs and scenarios
7. **Document your code**: Add comments to explain complex logic

## Examples

### Simple Counter

```
@app "Counter"
@description "A simple counter application"

@variables:
  count = "0"

@ui:
  layout:
    - section: main
  
  components:
    main:
      - heading: {text: "Counter"}
      - text: {content: "Current count: {count}"}
      - button: {label: "Increment", onClick: "increment"}
      - button: {label: "Decrement", onClick: "decrement"}
      - button: {label: "Reset", onClick: "reset"}

@actions:
  increment:
    - set: {count: "{count + 1}"}
  
  decrement:
    - set: {count: "{count - 1}"}
  
  reset:
    - set: {count: "0"}
```

### Todo List

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
      - input: {value: "{newTodo}", onChange: "updateNewTodo", placeholder: "Add a new todo"}
      - button: {label: "Add", onClick: "addTodo"}
    
    list:
      - forEach: {items: "{todos}", as: "todo", index: "i", do: [
          - container: {className: "todo-item", children: [
              - checkbox: {checked: "{todo.completed}", onChange: "toggleTodo", params: {index: "{i}"}}
              - text: {content: "{todo.text}", className: "{todo.completed ? 'completed' : ''}"}
              - button: {label: "Delete", onClick: "deleteTodo", params: {index: "{i}"}}
            ]}
        ]}

@actions:
  updateNewTodo:
    - set: {newTodo: "{event.value}"}
  
  addTodo:
    - if: {condition: "{newTodo.trim() != ''}", then: [
        - set: {todos: "{[...todos, {text: newTodo, completed: false}]}"}
        - set: {newTodo: ""}
      ]}
  
  toggleTodo:
    - set: {todos: "{todos.map((t, i) => i == event.params.index ? {...t, completed: !t.completed} : t)}"}
  
  deleteTodo:
    - set: {todos: "{todos.filter((t, i) => i != event.params.index)}"}
```

### AI Image Generator

```
@app "AI Image Generator"
@description "Generates images from text descriptions using AI"

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
      - text: {content: "Enter a description to generate an image"}
    
    input:
      - textarea: {value: "{prompt}", onChange: "updatePrompt", placeholder: "A futuristic city with flying cars..."}
      - button: {label: "{isGenerating ? 'Generating...' : 'Generate Image'}", onClick: "generateImage", disabled: "{isGenerating || prompt.trim() == ''}"}
    
    output:
      - if: {condition: "{error != ''}", then: [
          - text: {content: "Error: {error}", className: "error-message"}
        ]}
      - if: {condition: "{generatedImage != ''}", then: [
          - text: {content: "Generated Image:"}
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
    - if: {condition: "{generatedImage != ''}", then: [
        - set: {downloadUrl: "{generatedImage}"}
        - set: {filename: "generated-image.png"}
        - download: {url: "{downloadUrl}", filename: "{filename}"}
      ]}

@mods:
  - visual-create
```

This reference should help you understand and use the Percertain DSL effectively. For more examples and tutorials, check out the Examples section of the documentation.
