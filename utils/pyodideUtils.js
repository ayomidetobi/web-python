import { setupPyodideStdout } from "./stdout";
import { installDependencies } from "./dependencies";
import { setupFileSystem } from "./fileSystem";

export let pyodide = null;

export const initializePyodide = async (output) => {
  output.value = "Loading Python environment...";
  const config = useRuntimeConfig();
  const apiKey = config.public.apiKey;

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(script);

  await new Promise((resolve) => (script.onload = resolve));

  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
  });

  setupPyodideStdout(output);

  try {
    output.value = "Installing dependencies...";
    await installDependencies(pyodide, apiKey);
    
    setupFileSystem(pyodide, apiKey);
    
    output.value = "Python environment ready with Inductiva and dependencies installed!";
  } catch (error) {
    output.value = `Error installing packages: ${error.message}`;
  }
};
