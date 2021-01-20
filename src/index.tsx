import * as esbuild from 'esbuild-wasm';
import { unpkgAid } from './helpers/unpkgAid';
import ReactDOM from 'react-dom';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

const App = () => {
  const [userCode, setUserCode] = useState<string>("");
  const [spitCode, setSpitCode] = useState<string>("");
  const WASM = useRef<any>();

  const startWASM = async () => {
    WASM.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm'
    });
  }

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>) => setUserCode(e.target.value);

  const handleTranspile = async () => {
    if (!WASM.current) return;

    const result = await WASM.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgAid()],
      define: {
        "process.env.NODE_ENV": "'production'",
        global: "window"
      }
    });

    console.log(result)
    setSpitCode(result.outputFiles[0].text);
  }

  useEffect(() => {
    startWASM();
  }, []);

  return (
    <div>
      <textarea
        onChange={ e => setUserCode(e.target.value) }
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