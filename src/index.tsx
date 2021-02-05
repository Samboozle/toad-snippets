// React imports
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

// WASM logic
import * as esbuild from 'esbuild-wasm';
import { fetchPkgPlugin, unpkgPathPlugin } from './helpers/';

// Components
import { CodeEditor } from './components';

const App = () => {
  const [userCode, setUserCode] = useState<string>("");
  const WASM = useRef<any>();
  const iframe = useRef<any>();

  const startWASM = async () => {
    WASM.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    });
  }

  const handleUserInput = (e: ChangeEvent<HTMLTextAreaElement>) => setUserCode(e.target.value);

  const handleTranspile = async () => {
    if (!WASM.current) return;

    // reset iframe contents
    iframe.current.srcdoc = iframeHTML;
    
    // outputFiles[0] is an object whose text property
    // is our transpiled javaScript! Let's pattern match.
    const { outputFiles: [ { text } ] } = await WASM.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [
        unpkgPathPlugin(),
        fetchPkgPlugin(userCode)
      ],
      define: {
        "process.env.NODE_ENV": "'production'",
        global: "window"
      }
    });
    
    iframe.current.contentWindow.postMessage(text, "*");
  }

  useEffect(() => {
    startWASM();
  }, []);

  return (
    <div>
      <CodeEditor
        initialValue="const a = 1;"
        onChange={(value) => setUserCode(value)}
      />
      <textarea
        onChange={ handleUserInput }
        value={ userCode }
      />
      <br />
      <button onClick={ handleTranspile }>Submit</button>
      <br />
      <iframe
        ref={ iframe }
        sandbox="allow-scripts"
        srcDoc={ iframeHTML }
        title="code preview"
      />
    </div>
  );
}

const iframeHTML = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>
        window.addEventListener('message', ({ data }) => {
          try {
            eval(data);
          } catch (err) {
            document
              .querySelector('#root')
              .innerHTML = '<div style="color: red"><h4>Runtime error:</h4>' + err + '</div>';
            console.error(err);
          }
        }, false);
      </script>
    </body>
  </html>
`;

ReactDOM.render(
  <App />,
  document.querySelector("#root")
);
