export const installDependencies = async (pyodide, apiKey) => {
    await pyodide.loadPackage(["micropip"]);
  
    await pyodide.runPythonAsync(`
        import micropip
        import os
        import platform
        import sys
  
        platform.system = lambda: "darwin"
        
        os.environ["INDUCTIVA_API_KEY"] = "${apiKey}"
        os.environ["INDUCTIVA_TASK_LOGS_URL"] = "wss://logs.inductiva.ai"
        os.environ["INDUCTIVA_TURN_SERVER_URL"] = "webrtc.inductiva.ai:3478"
        os.environ["INDUCTIVA_TASK_RUNNER_IMAGE"] = "inductiva/task-runner:main"
        os.environ["INDUCTIVA_FILE_TRACKER_IMAGE"] = "inductiva/file-tracker:main"
        os.environ["PYODIDE_NO_THREADS"] = "1"
  
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
  
        sys.modules['aiortc'].RTCSessionDescription = RTCSessionDescription
        sys.modules['aiortc'].RTCPeerConnection = RTCPeerConnection
        sys.modules['aiortc'].RTCIceServer = RTCIceServer
  
        async def install_deps():
            dependencies = [
                'multidict', 'aiohttp', 'certifi', 'frozendict', 'fsspec',
                'jinja2', 'python-dateutil', 'requests', 'setuptools', 'tabulate',
                'tqdm', 'typing-extensions', 'urllib3', 'ssl', 'websocket-client'
            ]
  
            for dep in dependencies:
                try:
                    print(f"Installing {dep}...")
                    await micropip.install(dep)
                    print(f"Successfully installed {dep}")
                except Exception as e:
                    print(f"Failed to install {dep}: {e}")
  
            print("Installing Inductiva...")
            await micropip.install('inductiva', deps=False , keep_going=True)
            print("Inductiva installation complete!")
  
            import urllib3.contrib.emscripten.response as em_response
            if not hasattr(em_response.EmscriptenHttpResponseWrapper, "supports_chunked_reads"):
                def fake_supports_chunked_reads(self):
                    return False
                em_response.EmscriptenHttpResponseWrapper.supports_chunked_reads = fake_supports_chunked_reads
  
        await install_deps()

    `);
  };
  