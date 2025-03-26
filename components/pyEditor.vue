<template>
    <div class="py-playground">
      <div class="editor-container">
        <div class="toolbar">
          <Button @click="runCode" label="Run" icon="pi pi-play" class="run-button" />
        </div>
        <div ref="editorContainer" class="editor"></div>
      </div>
      <div class="output-container">
  <div class="output-header">
    <span class="header-title">Output</span>
  </div>
  <div class="output-content">
    <div v-if="loading" class="loading">Running...</div>
    <pre v-else><code v-html="formattedOutput"></code></pre>
  </div>
</div>

    </div>
</template>

  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import { initializeEditor } from "/utils/codeMirrorUtils.js";
  import { initializePyodide} from "/utils/pyodideUtils.js";
  import { runPythonCode } from "../utils/runner";
  const editorContainer = ref(null);
  const output = ref("# Output will appear here");
  const loading = ref(false);
  let editorView = null;
  
  // Sample starter code
  const initialCode = `# Write your Python code here
import urllib3
import json

# Initialize a PoolManager instance
http = urllib3.PoolManager()

# Make a GET request
response = http.request("GET", "https://jsonplaceholder.typicode.com/posts")

# Print response status and content
data = json.loads(response.data.decode("utf-8"))
print(data)
 

  `;
  
  onMounted(async () => {
    editorView = initializeEditor(editorContainer, initialCode);
    await initializePyodide(output);
  });
  
  const runCode = async () => {
    const code = editorView.state.doc.toString();
    await runPythonCode(code, output, loading);
  };
  
  const formattedOutput = computed(() => {
  return output.value
    .replace(/\n/g, "<br>") // Preserve new lines
    .replace(/Error:.*/g, '<span class="error">$&</span>'); 
});
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
    border: 1px solid #595858;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--ind-container-bg);
    margin-top: 30px;
  }
  
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 60%;
    border-bottom: 1px solid #595858;
  }
  
  .toolbar {
    display: flex;
    padding: 8px;
    background-color: var(--ind-container-bg);
    border-bottom: 1px solid #595858;
    justify-content: space-between;
  }
  
  .run-button {
    background-color: #00e979;
    color: var(--ind-dark-int);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-left: auto;
  }
  
  .run-button:hover {
    background-color: #45a049;
  }
  
  .editor {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    overflow: auto;
    background-color: var(--ind-container-bg);
  }
  
  .output {
    height: 40%;
    padding: 16px;
    background-color: var(--ind-container-bg);
    color: #fbfafa;
    overflow: auto;
    white-space: pre-wrap;
  }
  
  .output-container {
  display: flex;
  flex-direction: column;
  height: 40%;
  background-color: var(--ind-container-bg);
  border-top: 1px solid #3c3c3c;
  border-radius: 0 0 5px 5px;
  font-family: "Courier New", monospace;
}

.output-header {
  background-color: #2d2d2d;
  color: #bbb;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  align-items: center;
}

.header-title {
  color: #00e979; /* Green text like VS Code terminal */
}

.output-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  white-space: pre-wrap;
  color: #d4d4d4; /* Default output text */
  font-size: 14px;
  background-color: #1e1e1e;
}

.loading {
  color: #ffa500; /* Orange color for "Running..." text */
}

.error {
  color: #ff5555; /* Red color for error messages */
}

</style>
  