# Part1

Created by: deadDeveloper
Created time: March 23, 2025 11:40 PM
Last updated time: March 23, 2025 11:40 PM

# **Exploring Perchance-Inspired FastHTML DSL**

Looking at Perchance.org's approach offers valuable insights for our DSL design. Their markup language is brilliant in its simplicity yet powerful in functionality - allowing non-programmers to create complex generators with declarative syntax while enabling modularity through plugins.

## **FastHTML Concept**

Your FastHTML concept is intriguing - combining Python's familiarity with HTML-like declarative structure could create an excellent foundation for AI-assisted development. This would enable:

1. Rapid application prototyping
2. Accessible development for non-programmers
3. Easy integration with AI capabilities
4. Much lower configuration overhead than Hugging Face Spaces

## **Proposed FastHTML DSL Structure**

Let's design a DSL that captures this vision:

```
RunCopy code
1#app "My FastHTML App"
2#description "A simple example app built with FastHTML"
3
4#imports
5  - streamlit
6  - pandas
7  - plotly
8
9#style
10  theme: light
11  accent: #3366FF
12  typography: modern
13
14#layout
15  <main>
16    <header>
17      <h1>{$title}</h1>
18      <p>{$description}</p>
19    </header>
20
21    <section id="data-input">
22      {input.file(type=csv, variable=$data)}
23      {input.slider(min=1, max=100, variable=$sample_size)}
24    </section>
25
26    <section id="visualization">
27      {when $data:
28         chart.line(
29           data=$data,
30           x="date",
31           y="value",
32           title="Data Trends",
33           sample=$sample_size
34         )
35      }
36    </section>
37
38    <section id="analysis">
39      {ai.analyze(
40        data=$data,
41        question="What are the key trends?",
42        output_variable=$insights
43      )}
44
45      <div class="insights-box">
46        {$insights}
47      </div>
48    </section>
49  </main>
50
51#logic
52  @on_data_upload:
53    $data = clean_data($data)
54    $summary = $data.describe()
55
56  @function clean_data(df):
57    # Remove duplicates
58    df = df.drop_duplicates()
59    # Handle missing values
60    df = df.fillna(df.mean())
61    return df
62
63#settings
64  cache: true
65  authenticate: false
66  share: public

```

## **Key Features of This Approach**

1. **Declarative Structure**: Similar to Perchance but with Python-inspired syntax
2. **Built-in Data Flow**: Variables with **`$`** prefix enable data binding
3. **Conditional Logic**: Simple conditionals with **`{when}`** blocks
4. **Component Library**: Pre-built components for common UI elements
5. **AI Integration**: Native syntax for AI operations like **`ai.analyze()`**
6. **Minimal Logic Section**: Python-like functions for necessary custom logic
7. **Configuration by Convention**: Sensible defaults with minimal required setup

## **Implementation Path**

This could be implemented as:

1. A parser that converts FastHTML to Python/Streamlit code
2. A runtime that interprets FastHTML directly
3. An AI assistant specifically trained to translate between natural language and FastHTML

## **Comparison with Perchance**

While Perchance focuses on randomized content generation, FastHTML focuses on application development with data processing and visualization while maintaining the same declarative simplicity that makes Perchance accessible.

Do you want to refine this concept further? We could expand on specific components, the execution model, or how AI would interpret natural language instructions into FastHTML code.

**You**

well wait, fastHTML is an existing python web development framework. Its essentially html fused with python.

i was thinking of taking perchance's approach, but with fastHTML instead of HTML.

so people wouldnt need to import gradio or streamlit, because fastHTML would provide basically all the visual interface needed..

and then our custom DSL would be the next logical evolution to perchance's DSL, taking it up a notch as far as capability, keeping the simplicity and the modularity with plugins (we can just call them Mods)

**BLACKBOXAI**

# **FastHTML + Perchance-Inspired DSL**

You're right - FastAPI/FastHTML does exist as a Python web framework. Let's refine our approach to build upon that foundation rather than reinventing it.

## **Revised Concept: Perchance-Inspired DSL with FastHTML Backend**

This approach would create a simple declarative language that:

1. Compiles down to FastHTML/Python
2. Maintains the modularity and simplicity of Perchance
3. Eliminates the need for explicit Gradio/Streamlit imports
4. Creates a powerful "generator" system for web applications

## **Proposed DSL Structure**

```
RunCopy code
1// App declaration
2@app "DataViz Creator"
3@version 1.0
4@author "Your Name"
5
6// Data sources
7@data:
8  users: {source: "csv", path: "users.csv"}
9  metrics: {source: "api", url: "https://api.example.com/metrics"}
10
11// UI components with nested structure
12@ui:
13  header:
14    title: "Data Analysis Dashboard"
15    subtitle: "{$time | format: 'Today is %A, %B %d'}"
16
17  sidebar:
18    filter: {type: "multiselect", options: "{$users.country | unique}", bind: "$selected_countries"}
19    dateRange: {type: "daterange", bind: "$date_range"}
20
21  main:
22    tabs:
23      - name: "Overview"
24        content:
25          chart: {
26            type: "bar",
27            data: "{$users | filter: country in $selected_countries}",
28            x: "signup_date",
29            y: "count",
30            groupBy: "country"
31          }
32
33      - name: "Details"
34        content:
35          table: {
36            data: "{$users | filter: country in $selected_countries}",
37            columns: ["name", "email", "country", "signup_date"],
38            pagination: true,
39            search: true
40          }
41
42// Mods (plugins) with parameterization
43@mods:
44  - name: "AIInsights"
45    config: {
46      model: "gpt-4",
47      prompt: "Analyze trends in user signups from {$selected_countries} during {$date_range}"
48    }
49
50  - name: "ExportTools"
51    config: {
52      formats: ["csv", "json", "pdf"]
53    }
54
55// Event handlers
56@events:
57  onCountrySelect:
58    ```
59    // This uses a simplified Python-like syntax
60    if len($selected_countries) > 5:
61      notify("Please select fewer countries for better performance")
62
63    $filtered_data = filter_by_countries($users, $selected_countries)
64    ```
65
66  onExport:
67    ```
68    format = $event.format
69    filename = f"export_{$date_range.start}_{$date_range.end}.{format}"
70    export_data($filtered_data, filename, format)
71    ```
72
73// Function definitions (simplified Python)
74@functions:

```

def filter_by_countries(data, countries): return data[data.country.isin(countries)]

def export_data(data, filename, format): if format == "csv": data.to_csv(filename) elif format == "json": data.to_json(filename) # ...

```
RunCopy code
1undefined

```

## **Key Differentiators from Perchance**

1. **First-class Data Handling**: Built-in data binding, filtering, and transformations
2. **Component Composition**: Nested UI structure with inheritance and composition
3. **Event System**: Simple event handlers for interactivity
4. **AI Integration**: Direct integration with AI models through mods
5. **Python Escape Hatches**: The ability to drop into Python when needed
6. **Mobile-First**: Responsive design built into component defaults

## **Implementation Path**

The DSL would compile to FastHTML/Python code, which would handle:

1. Setting up the FastAPI server
2. Loading and processing data
3. Rendering the UI components
4. Handling user interactions

## **Example of Generated FastHTML**

Our DSL would generate FastHTML/Python code like:

```
pythonRunCopy code
1from fastapi import FastAPI
2from fasthtml.components import *

```

**You**

well, in perchance you write the custom DSL language in a visual interface for building the generators, on the left you write the DSL code, and on the bottom right you add the HTML. the the top right shows the output.

i think they use split.js (is that it?) to create the resizable windows and stuff.

but forget about the perchance visual editor, its their DESIGN and Functionality and how they were able to succesfully create something so sophisticated with such simplicity that is what I am after.

with the age of Agents and Vibe coding, we can take perchance, and make it percertain

**BLACKBOXAI**

# **Percertain: A Perchance-Inspired DSL for AI-Powered App Generation**

Now I understand your vision better. Let's focus on the design principles that made Perchance successful and apply them to create "Percertain" - a simple yet powerful DSL for AI-assisted app development.

## **Core Design Principles from Perchance**

1. **Simplicity First**: Accessible syntax that non-programmers can grasp
2. **Modular Components**: Building blocks that can be combined
3. **Declarative Approach**: Focus on what, not how
4. **Progressive Complexity**: Simple things are simple, complex things are possible

## **Percertain DSL Design**

```
RunCopy code
1// App declaration
2title: My Data Visualization App
3description: Easily explore CSV data with AI insights
4
5// Data sources
6data:
7  myData: {source: csv}
8
9// Variables - global state management
10variables:
11  selectedColumns: []
12  insightQuestion: "What trends do you see?"
13
14// UI components
15ui:
16  // Simple layout using sections
17  layout:
18    - section: header
19    - section: dataInput
20    - section: visualization
21    - section: aiInsights
22
23  // Component definitions
24  components:
25    header:
26      - heading: {text: "{title}"}
27      - text: {content: "{description}"}
28
29    dataInput:
30      - upload: {
31          label: "Upload your CSV file",
32          bind: myData,
33          onChange: processData
34        }
35      - select: {
36          label: "Columns to visualize",
37          options: "{myData.columns}",
38          multiple: true,
39          bind: selectedColumns
40        }
41
42    visualization:
43      - when: "{myData != null}"
44        show:
45          - tabs:
46              - name: "Chart"
47                content:
48                  - chart: {
49                      type: "auto",
50                      data: "{myData}",
51                      columns: "{selectedColumns}"
52                    }
53              - name: "Table"
54                content:
55                  - table: {
56                      data: "{myData}",
57                      pagination: true,
58                      search: true
59                    }
60
61    aiInsights:
62      - when: "{myData != null}"
63        show:
64          - input: {
65              type: "text",
66              label: "Ask AI about your data",
67              bind: insightQuestion
68            }
69          - button: {
70              text: "Analyze",
71              action: generateInsights
72            }
73          - card: {
74              title: "AI Insights",
75              content: "{insights}"
76            }
77
78// Actions - simple functions
79actions:
80  processData:
81    """
82    # This automatically converts to appropriate types
83    myData.autoDetectTypes()
84
85    # Auto-select numeric columns for visualization
86    selectedColumns = myData.getNumericColumns()[:2]
87    """
88
89  generateInsights:
90    """
91    # Use AI to analyze the data
92    insights = ai.analyze(
93      data: myData,
94      question: insightQuestion,
95      visualize: true
96    )
97    """
98
99// Plugins/Mods for extensibility
100plugins:
101  - ai:
102      model: gpt-4
103      temperature: 0.7
104
105  - export:
106      formats: [csv, pdf, png]
107
108  - sharing:
109      enabled: true
110      platforms: [link, twitter, email]

```

## **Key Features**

1. **AI-First**: Built-in AI analysis capabilities
2. **Reactive Data Binding**: Simple **`{variable}`** syntax for data flow
3. **Conditional Rendering**: With **`when`** statements
4. **Auto-Visualization**: Smart defaults for visualizing data
5. **Plugin System**: Extensible with custom capabilities
6. **Minimal Code**: Focus on intent rather than implementation

## **Implementation Approach**

Unlike Perchance (which focuses on text generation), Percertain would:

1. Generate full-stack applications using FastHTML/Python backend
2. Provide intuitive visualization components out of the box
3. Incorporate AI analysis as a first-class feature
4. Allow saving/sharing of created applications
5. Support both web and mobile interfaces

The beauty of this approach is that end users describe what they want at a high level, and the system handles all the complexity of implementation behind the scenes. This allows users to focus on their ideas rather than the technical details.

## **User Experience Flow**

1. **Onboarding**: Users are guided through a simple setup process, introducing them to the DSL syntax and capabilities.
2. **Interactive Editor**: A split interface where users can write DSL code on one side, see a live preview of their application on the other, and access documentation or examples as needed.
3. **Instant Feedback**: As users modify their DSL code, the application updates in real-time, allowing for rapid iteration and experimentation.
4. **AI Assistance**: Users can ask the AI for suggestions or improvements, making the development process more collaborative and intuitive.
5. **Export and Share**: Once satisfied, users can easily export their applications in various formats or share them directly with others.

## **Future Enhancements**

1. **Community Plugins**: Encourage users to create and share their own mods/plugins, fostering a community-driven ecosystem.
2. **Advanced AI Features**: Integrate more sophisticated AI capabilities, such as predictive analytics or natural language processing for data queries.
3. **Mobile Optimization**: Ensure that applications built with Percertain are fully responsive and optimized for mobile devices.
4. **Performance Monitoring**: Provide tools for users to monitor the performance of their applications and optimize them as needed.

By focusing on these aspects, Percertain can become a powerful tool for both novice and experienced developers, enabling them to create sophisticated applications with ease and efficiency.

**You**

so for the plugins, (mods) instead of just like

mods: ai: gpt-4 etc

they should be more focused and implicitly AI driven already.

mods: data-visual{visual | data}, # provides an AI for visualizing data structures img-visual{visual | images}, # provides an image generation model AI think-data{reasoning | data}, # provides an AI for reasoning and text generation (like deepseek-r1) think-visual{reasoning | images}, # provides a vision model for analyzing images

Huggingface - open source goldmine: most of our mods can be created with huggingface open source and free models such as deepseek-r1, llama 3.3 vision, etc.

this would reduce costs and allow users to immediatley start building without worrying about costs

**BLACKBOXAI**

# **Enhanced Percertain with AI-Focused Mods**

I love your direction with the AI-focused mods! This approach makes the AI capabilities more specific, purpose-driven, and accessible. Let's refine the DSL with this enhanced modularity:

```
RunCopy code
1// App declaration
2title: Data Insight Explorer
3description: Create visualizations and gain insights from your data
4
5// Data sources
6data:
7  salesData: {source: csv}
8  imageCollection: {source: folder, path: "product_images/"}
9
10// Variables
11variables:
12  selectedMetric: "revenue"
13  timeRange: "last_quarter"
14  insightDepth: "comprehensive"
15  generatedChart: null
16
17// UI components
18ui:
19  layout:
20    - section: header
21    - section: dataPicker
22    - section: visualization
23    - section: insights
24    - section: imageAnalysis
25
26  components:
27    header:
28      - heading: {text: "{title}"}
29      - text: {content: "{description}"}
30
31    dataPicker:
32      - upload: {
33          label: "Upload sales data (CSV)",
34          bind: salesData
35        }
36      - select: {
37          label: "Key Metric",
38          options: ["revenue", "units_sold", "profit_margin"],
39          bind: selectedMetric
40        }
41      - daterange: {
42          label: "Time Period",
43          bind: timeRange
44        }
45
46    visualization:
47      - when: "{salesData != null}"
48        show:
49          - button: {
50              text: "Generate Optimal Visualization",
51              action: createVisualization
52            }
53          - container: {
54              id: "chartArea",
55              content: "{generatedChart}"
56            }
57
58    insights:
59      - when: "{salesData != null}"
60        show:
61          - select: {
62              label: "Analysis Depth",
63              options: ["quick", "detailed", "comprehensive"],
64              bind: insightDepth
65            }
66          - button: {
67              text: "Generate Insights",
68              action: analyzeData
69            }
70          - card: {
71              title: "Strategic Insights",
72              content: "{insights}"
73            }
74
75    imageAnalysis:
76      - when: "{imageCollection != null}"
77        show:
78          - gallery: {
79              images: "{imageCollection}",
80              selectable: true,
81              bind: selectedImages
82            }
83          - button: {
84              text: "Analyze Product Images",
85              action: analyzeImages
86            }
87          - card: {
88              title: "Visual Analysis",
89              content: "{imageInsights}"
90            }
91
92// Actions
93actions:
94  createVisualization:
95    """
96    generatedChart = mods.dataVisual.optimize(
97      data: salesData,
98      metric: selectedMetric,
99      timeframe: timeRange,
100      goal: "highlight_trends"
101    )
102    """
103
104  analyzeData:
105    """
106    insights = mods.thinkData.analyze(
107      data: salesData,
108      focus: selectedMetric,
109      timeframe: timeRange,
110      depth: insightDepth,
111      output_format: "markdown"
112    )
113    """
114
115  analyzeImages:
116    """
117    imageInsights = mods.thinkVisual.analyze(
118      images: selectedImages,
119      aspects: ["product_appeal", "branding_consistency", "visual_quality"],
120      suggestions: true
121    )
122    """
123
124// Mods - AI-focused capabilities
125mods:
126  - dataVisual: {
127      capability: "visual | data",
128      model: "llama-3.1-viz", // Open source visualization specialist
129      description: "Creates optimal data visualizations based on data characteristics",
130      autoAdapt: true // Automatically adapts charts to data patterns
131    }
132
133  - imgVisual: {
134      capability: "visual | images",
135      model: "stable-diffusion-xl-base-1.0", // Open source image generation
136      description: "Generates and modifies images based on text descriptions",
137      styles: ["photorealistic", "abstract", "product_showcase"]
138    }
139
140  - thinkData: {
141      capability: "reasoning | data",
142      model: "deepseek-r1- description: "Provides reasoning and insights based on data analysis",
143      features: ["trend_analysis", "anomaly_detection", "forecasting"]
144    }
145
146  - thinkVisual: {
147      capability: "reasoning | images",
148      model: "llama-3.3-vision", // Open source vision model
149      description: "Analyzes images for content and context, providing actionable insights",
150      features: ["object_recognition", "scene_analysis", "branding_evaluation"]
151    }
152
153// Future Enhancements
1541. **User -Driven Mod Creation**: Allow users to create and share their own mods using Hugging Face models, fostering a collaborative environment.
1552. **Cost Management Tools**: Implement features that help users track and manage their usage of AI resources, ensuring they stay within budget.
1563. **Enhanced Documentation**: Provide comprehensive guides and examples for each mod, making it easier for users to understand and utilize the capabilities.
1574. **Community Support**: Establish forums or channels for users to share experiences, tips, and best practices related to using Percertain and its mods.
158
159By focusing on these AI-driven mods and enhancing user experience, Percertain can empower users to leverage advanced AI capabilities while maintaining simplicity and accessibility in their app development process.

```

**You**

I think that the mods can be even more implicit. if were using huggingface models, we dont really need to declare the model. we can either just use the best model for the Mod, or use huggingface's auto routing inference to pick the best model for the task

**BLACKBOXAI**

# **Percertain with Implicit AI Mods**

You're absolutely right! We can simplify the mod system further and make it more implicit. This approach makes the system more user-friendly while leveraging Hugging Face's capabilities to automatically select the best model for each task.

## **Refined Mod System**

```
RunCopy code
1// App declaration
2title: Data Insight Explorer
3description: Create visualizations and gain insights from your data
4
5// Data sources
6data:
7  salesData: {source: csv}
8  customerImages: {source: folder, path: "customer_photos/"}
9
10// Variables
11variables:
12  marketSegment: "enterprise"
13  timeFrame: "quarterly"
14  insightQuestion: "What are the key growth opportunities?"
15
16// UI components
17ui:
18  layout:
19    - section: header
20    - section: dataInput
21    - section: analysis
22    - section: visualization
23    - section: imageSection
24
25  components:
26    header:
27      - heading: {text: "{title}"}
28      - text: {content: "{description}"}
29
30    dataInput:
31      - upload: {
32          label: "Upload your data",
33          bind: salesData
34        }
35      - select: {
36          label: "Market Segment",
37          options: ["enterprise", "mid-market", "small-business"],
38          bind: marketSegment
39        }
40
41    analysis:
42      - when: "{salesData != null}"
43        show:
44          - input: {
45              type: "text",
46              label: "What would you like to know?",
47              placeholder: "Ask a question about your data...",
48              bind: insightQuestion
49            }
50          - button: {
51              text: "Generate Insights",
52              action: analyzeData
53            }
54          - card: {
55              title: "AI Analysis",
56              content: "{insights}"
57            }
58
59    visualization:
60      - when: "{salesData != null && insights != null}"
61        show:
62          - container: {
63              id: "vizArea",
64              content: "{generatedViz}"
65            }
66
67    imageSection:
68      - when: "{customerImages != null}"
69        show:
70          - gallery: {
71              images: "{customerImages}",
72              selectable: true,
73              bind: selectedImages
74            }
75          - button: {
76              text: "Analyze Customer Photos",
77              action: analyzeImages
78            }
79          - card: {
80              title: "Customer Image Insights",
81              content: "{imageAnalysis}"
82            }
83
84// Actions - using mods implicitly
85actions:
86  analyzeData:
87    """
88    // The system automatically uses the appropriate AI based on the task
89    insights = think(
90      data: salesData,
91      question: insightQuestion,
92      context: {
93        segment: marketSegment,
94        timeFrame: timeFrame
95      }
96    )
97
98    // Generate visualization based on the insights
99    generatedViz = visualize(
100      data: salesData,
101      insights: insights,
102      type: "auto"  // AI determines the best visualization type
103    )
104    """
105
106  analyzeImages:
107    """
108    // System uses the best vision model automatically
109    imageAnalysis = see(
110      images: selectedImages,
111      analyze: ["demographics", "sentiment", "engagement"],
112      summarize: true
113    )
114    """
115
116// Mods - simplified and implicit
117mods:
118  - think  // AI reasoning and text generation
119  - see    // Computer vision capabilities
120  - visualize  // Data visualization
121  - create  // Content generation
122  - predict  // Forecasting and prediction

```

## **Key Improvements**

1. **Ultra-Simplified Syntax**: Mods are now just capabilities without explicit model selection
2. **Verb-Based Actions**: The mod names are intuitive verbs (think, see, visualize, create, predict)
3. **Auto-Optimization**: System automatically selects the optimal model based on:
    - Task requirements
    - Data characteristics
    - Performance considerations
    - Available compute resources
4. **Context-Aware Processing**: AI understands the context of the application and adapts accordingly

## **User-Friendly Mod Implementation**

```
RunCopy code
1// Examples of using implicit mods
2
3// Text generation and reasoning
4insights = think(
5  data: userData,
6  question: "What patterns do you see in customer retention?",
7  style : "detailed"
8)
9
10// Visualizing data insights
11generatedViz = visualize(
12  data: salesData,
13  insights: insights,
14  type: "interactive"  // AI selects the best interactive visualization
15)
16
17// Analyzing images for customer engagement
18imageAnalysis = see(
19  images: customerImages,
20  analyze: ["engagement", "brand_perception"],
21  summarize: true
22)

```

This streamlined approach not only enhances usability but also empowers users to focus on their objectives without getting bogged down by technical details. By leveraging Hugging Face's capabilities, we can ensure that the best models are utilized seamlessly, allowing for a more efficient and effective user experience. ``` // App declaration title: Customer Engagement Analyzer description: Analyze customer interactions and derive actionable insights

// Data sources data: interactionData: {source: csv} feedbackImages: {source: folder, path: "feedback_images/"}

// Variables variables: selectedCategory: "service" analysisPeriod: "monthly" inquiry: "What are the main concerns of our customers?"

// UI components ui: layout: - section: header - section: inputData - section: feedbackAnalysis - section: visualization - section: imageFeedback

components: header: - heading: {text: "{title}"} - text: {content: "{description}"}

```
RunCopy code
1inputData:
2  - upload: {
3      label: "Upload interaction data",
4      bind: interactionData
5    }
6  - select: {
7      label: "Feedback Category",
8      options: ["service", "product", "support"],
9      bind: selectedCategory
10    }
11
12feedbackAnalysis:
13  - when: "{interactionData != null}"
14    show:
15      - input: {
16          type: "text",
17          label: "Customer Inquiry",
18          placeholder: "What would you like to analyze?",
19          bind: inquiry
20        }
21      - button: {
22          text: "Analyze Feedback",
23          action: analyzeFeedback
24        }
25      - card: {
26          title: "Feedback Insights",
27          content: "{feedbackInsights}"
28        }
29
30visualization:
31  - when: "{interactionData != null && feedbackInsights != null}"
32    show:
33      - container: {
34          id: "feedbackVizArea",
35          content: "{feedbackVisualization}"
36        }
37
38imageFeedback:
39  - when: "{feedbackImages != null}"
40    show:
41      - gallery: {
42          images: "{feedbackImages}",
43          selectable: true,
44          bind: selectedFeedbackImages
45        }
46      - button: {
47          text: "Analyze Feedback Images",
48          action: analyzeFeedbackImages
49        }
50      - card: {
51          title: "Image Feedback Insights",
52          content: "{imageFeedbackAnalysis}"
53        }

```

// Actions - using mods implicitly actions: analyzeFeedback: """ feedbackInsights = think( data: interactionData, question: inquiry, context: { category: selectedCategory, period: analysisPeriod } )

```
RunCopy code
1feedbackVisualization = visualize(
2  data: interactionData,
3  insights: feedbackInsights,
4  type: "dynamic"  // AI determines the best dynamic visualization
5)
6"""

```

analyzeFeedbackImages: """ imageFeedbackAnalysis = see( images: selectedFeedbackImages, analyze: ["customer_sentiment", "visual_feedback"], summarize: true ) """

// Mods - simplified and implicit mods:

- think // AI reasoning and text generation
- see // Computer vision capabilities
- visualize // Data visualization
- create // Content generation
- predict // Forecasting and prediction