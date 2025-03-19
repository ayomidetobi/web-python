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
  import { initializeEditor } from "/utils/codeMirrorUtils.js";
  import { initializePyodide, runPythonCode } from "/utils/pyodideUtils.js";
  
  const editorContainer = ref(null);
  const output = ref("# Output will appear here");
  const loading = ref(false);
  let editorView = null;
  
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
    editorView = initializeEditor(editorContainer, initialCode);
    await initializePyodide(output);
  });
  
  const runCode = async () => {
    const code = editorView.state.doc.toString();
    await runPythonCode(code, output, loading);
  };
  
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
  