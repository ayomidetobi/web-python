async function handlePythonRequest(requestData) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });
  
      const text = await response.text(); // Get response as text
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: text,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Expose to Pyodide
  globalThis.handle_python_request = handlePythonRequest;
  