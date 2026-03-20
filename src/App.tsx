import { useEffect, useState } from "react";

declare global {
  interface Window {
    Go: new () => {
      importObject: WebAssembly.Imports;
      run(instance: WebAssembly.Instance): Promise<void>;
    };
    wasmReady?: () => boolean;
  }
}

function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const base = import.meta.env.BASE_URL;

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${base}wasm_exec.js`;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("failed to load wasm_exec.js"));
          document.body.appendChild(script);
        });

        const go = new window.Go();

        const response = await fetch(`${base}main.wasm`);
        const bytes = await response.arrayBuffer();

        const result = await WebAssembly.instantiate(bytes, go.importObject);

        void go.run(result.instance);

        const ready = window.wasmReady?.();
        setStatus(ready ? "ready" : "not ready");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    void loadWasm();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Wasm check</h1>
      <p className="mt-4">status: {status}</p>
    </main>
  );
}

export default App;
