import * as esbuild from 'esbuild-wasm';
import { fetchPkgPlugin, unpkgPathPlugin } from './helpers/';
import ReactDOM from 'react-dom';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

const App = () => {
  const [userCode, setUserCode] = useState<string>("");
  const [spitCode, setSpitCode] = useState<string>("");
  const WASM = useRef<any>();

  const startWASM = async () => {
    WASM.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    });
  }

  const handleUserInput = (e: ChangeEvent<HTMLTextAreaElement>) => setUserCode(e.target.value);

  const handleTranspile = async () => {
    if (!WASM.current) return;

    const { outputFiles: [ transpiledCode ] } = await WASM.current.build({
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

    setSpitCode(transpiledCode);
  }

  useEffect(() => {
    startWASM();
  }, []);

  return (
    <div>
      <textarea
        onChange={ handleUserInput }
        value={ userCode }
      />
      <br />
      <button onClick={ handleTranspile }>Submit</button>
      <br />
      <pre>
        { spitCode }
      </pre>
    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
)