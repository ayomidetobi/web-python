export let pyodide = null;

export const initializePyodide = async (output) => {
  output.value = "Loading Python environment...";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
  document.head.appendChild(script);

  await new Promise((resolve) => (script.onload = resolve));
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
  });

  setupPyodideStdout(output);
  output.value = "Python environment ready!";
};

const setupPyodideStdout = (output) => {
  window.captureOutput = (text) => {
    output.value += text;
  };

  pyodide.runPython(`
    import sys
    import io

    original_stdout = sys.stdout

    def custom_print(*args, sep=' ', end='\\n', file=None, flush=False):
        output_text = sep.join(str(arg) for arg in args) + end
        from js import captureOutput
        captureOutput(output_text)
        original_stdout.write(output_text)
        if flush:
            original_stdout.flush()

    __builtins__.print = custom_print
  `);
};

export const runPythonCode = async (code, output, loading) => {
  if (!pyodide) {
    output.value = "Python environment is not ready yet. Please wait...";
    return;
  }

  try {
    loading.value = true;
    output.value = "";
    const result = await pyodide.runPythonAsync(code);
    output.value += result || "Execution finished.";
  } catch (error) {
    output.value = `Error: ${error.message}`;
  } finally {
    loading.value = false;
  }
};
