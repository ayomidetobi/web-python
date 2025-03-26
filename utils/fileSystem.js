export const setupFileSystem = (pyodide, apiKey) => {
    pyodide.FS.mkdir("/inductiva");
    pyodide.FS.mount(pyodide.FS.filesystems.IDBFS, {}, "/inductiva");
  
    // Create log file
    pyodide.FS.writeFile('/inductiva/inductiva.log', 'Inductiva log file initialized.\n');
  
    // Create API key file
    pyodide.FS.writeFile('/inductiva/api_key', apiKey);
  };
  