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
  