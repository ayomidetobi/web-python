<template>
    <div class="py-playground">
      <div class="editor-container">
        <div class="toolbar">
          <button @click="runCode" class="run-button">Run</button>
        </div>
        <div ref="editorContainer" class="editor"></div>
      </div>
      <div class="output">
        <div v-if="loading" class="loading">Running...</div>
        <pre v-else><code>{{ output }}</code></pre>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import { EditorState } from "@codemirror/state";
  import { EditorView, basicSetup } from "codemirror";
  import { python } from "@codemirror/lang-python";
  import {
  autocompletion, completionKeymap, closeBrackets,
  closeBracketsKeymap
} from "@codemirror/autocomplete"
  
  const editorContainer = ref(null);
  const output = ref("# Output will appear here");
  const loading = ref(false);
  let editorView = null;
  let pyodide = null;
  
  // Sample starter code
  const initialCode = `# Write your Python code here
def greet(name):
    return f"Hello, {name}!"
  
result = greet("World")
print(result)
  
  # Try some calculations
for i in range(5):
    print(f"{i} squared is {i**2}")
  `;
  
  onMounted(async () => {
    if (!editorContainer.value) {
      console.error("Editor container not found!");
      return;
    }
  
    // Initialize CodeMirror Editor
    editorView = new EditorView({
        doc: initialCode,
        parent: editorContainer.value,
        extensions: [basicSetup, python()],
    });
  
    // Load Pyodide for Python execution
    try {
      loading.value = true;
      output.value = "Loading Python environment...";
  
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      document.head.appendChild(script);
  
      await new Promise((resolve) => (script.onload = resolve));
      pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
      });
  
      setupPyodideStdout();
      output.value = "Python environment ready!";
    } catch (error) {
      output.value = `Error initializing Python: ${error.message}`;
      console.error("Pyodide initialization error:", error);
    } finally {
      loading.value = false;
    }
  });
  
  // Capture Python's stdout
  const setupPyodideStdout = () => {
    window.captureOutput = (text) => {
      output.value += text;
    };
  
    pyodide.runPython(`
      import sys
      import io
  
      # Store the original stdout
      original_stdout = sys.stdout
  
      # Custom print function that calls JavaScript
      def custom_print(*args, sep=' ', end='\\n', file=None, flush=False):
          output_text = sep.join(str(arg) for arg in args) + end
          from js import captureOutput
          captureOutput(output_text)
          original_stdout.write(output_text)
          if flush:
              original_stdout.flush()
  
      # Replace the built-in print function
      __builtins__.print = custom_print
    `);
  };
  
  // Run Python code
  const runCode = async () => {
    if (!pyodide) {
      output.value = "Python environment is not ready yet. Please wait...";
      return;
    }
  
    try {
      loading.value = true;
      output.value = "";
  
      const code = editorView.state.doc.toString();
      const result = await pyodide.runPythonAsync(code);
  
      output.value += result || "Execution finished.";
    } catch (error) {
      output.value = `Error: ${error.message}`;
    } finally {
      loading.value = false;
    }
  };
  
  // Clean up on unmount
  onBeforeUnmount(() => {
    if (editorView) {
      editorView.destroy();
    }
  });
  </script>
  
  <style scoped>
  .py-playground {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 60%;
    border-bottom: 1px solid #ccc;
  }
  
  .toolbar {
    display: flex;
    padding: 8px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
  }
  
  .run-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .run-button:hover {
    background-color: #45a049;
  }
  
  .editor {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    overflow: auto;
    background-color: #fbfafa;
    /* color: #ccc; */
  }
  
  .output {
    height: 40%;
    padding: 16px;
    background-color: #f5f5f5;
    overflow: auto;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
  }
  
  .loading {
    color: #666;
    font-style: italic;
  }
  </style>
  