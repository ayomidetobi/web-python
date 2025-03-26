export const setupPyodideStdout = (output) => {
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
  