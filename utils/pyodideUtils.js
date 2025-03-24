export let pyodide = null;

export const initializePyodide = async (output) => {
  output.value = "Loading Python environment...";
  const apiKey = process.env.INDUCTIVA_API_KEY; // Retrieve from environment or pass from frontend

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js";
  document.head.appendChild(script);

  await new Promise((resolve) => (script.onload = resolve));
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/",
  });

  setupPyodideStdout(output);

  try {
    output.value = "Installing dependencies...";

    // Install micropip and other dependencies asynchronously
    await pyodide.loadPackage(["micropip","aiohttp"]);

    // Pass the API key and manually set the required environment variables
    await pyodide.runPythonAsync(`
      import micropip
      import os
      import pathlib
      import platform
      import sys

      # Trick platform.system() to think we're on macOS or Ubuntu
      platform.system = lambda: "darwin"
      # Manually set environment variables to match Inductiva's expected values
      os.environ["INDUCTIVA_API_KEY"] = "${apiKey}"
      os.environ["INDUCTIVA_TASK_LOGS_URL"] = "wss://logs.inductiva.ai"
      os.environ["INDUCTIVA_TURN_SERVER_URL"] = "webrtc.inductiva.ai:3478"
      os.environ["INDUCTIVA_TASK_RUNNER_IMAGE"] = "inductiva/task-runner:main"
      os.environ["INDUCTIVA_FILE_TRACKER_IMAGE"] = "inductiva/file-tracker:main"

      sys.modules['aiortc'] = type(sys)('aiortc')

      class RTCSessionDescription:
          def __init__(self, sdp=None, type=None):
              self.sdp = sdp
              self.type = type
          def __repr__(self):
              return f"RTCSessionDescription(sdp={self.sdp}, type={self.type})"

      class RTCPeerConnection:
          def __init__(self):
              self.connected = False
          def createOffer(self):
              return "Offer created"
          def setRemoteDescription(self, desc):
              return "Remote description set"
          def addTrack(self, track):
              return f"Track {track} added"
      class RTCIceServer:
          def __init__(self, urls=None, username=None, credential=None):
              self.urls = urls
              self.username = username
              self.credential = credential
          def __repr__(self):
              return f"RTCIceServer(urls={self.urls}, username={self.username}, credential={self.credential})"

      # Assigning the mocked classes to the aiortc module
      sys.modules['aiortc'].RTCSessionDescription = RTCSessionDescription
      sys.modules['aiortc'].RTCPeerConnection = RTCPeerConnection
      sys.modules['aiortc'].RTCIceServer = RTCIceServer


      # Install dependencies for Inductiva
      async def install_dependencies():
          dependencies = [
              'certifi',
              'frozendict',
              'fsspec',
              'jinja2',
              'python-dateutil',
              'requests',
              'setuptools',
              'tabulate',
              'tqdm',
              'typing-extensions',
              'urllib3',
              'ssl',
              'websocket-client'
          ]

          for dep in dependencies:
              try:
                  print(f"Installing {dep}...")
                  await micropip.install(dep)
                  print(f"Successfully installed {dep}")
              except Exception as e:
                  print(f"Failed to install {dep}: {e}")

          # Install Inductiva without automatic dependency resolution
          print("Installing Inductiva...")
          await micropip.install('inductiva', deps=False)
          print("Inductiva installation complete!")


      # Run the installation
      await install_dependencies()

    `);
    pyodide.FS.mkdir("/inductiva");
    pyodide.FS.mount(pyodide.FS.filesystems.IDBFS, {}, "/inductiva");
 
     // Create the indcutiva.log file and simulate logs
    pyodide.FS.writeFile('/inductiva/inductiva.log', 'Inductiva log file initialized.\n');
 
     // Create the api_key file with the actual API key (this can be simulated in the browser memory)
    // pyodide.FS.writeFile('/inductiva/api_key',process.env.INDUCTIVA_API_KEY);

    output.value = "Python environment ready with Inductiva and dependencies installed!";
  } catch (error) {
    output.value = `Error installing packages: ${error.message}`;
  }
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
