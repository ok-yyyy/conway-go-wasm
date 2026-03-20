import { useEffect, useRef } from "react";

const WIDTH = 100;
const HEIGHT = 100;
const CELL_SIZE = 5;

declare global {
  interface Window {
    Go: new () => {
      importObject: WebAssembly.Imports;
      run(instance: WebAssembly.Instance): Promise<void>;
    };
    initBoard?: (w: number, h: number) => void;
    step?: () => void;
    getBoard?: () => Uint8Array;
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

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

        if (window.initBoard) {
          window.initBoard(WIDTH, HEIGHT);
          startLoop();
        }
      } catch (error) {
        console.error(error);
      }
    };

    const startLoop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const render = () => {
        // 1. Go 側で 1世代進める
        window.step?.();

        // 2. Go 側から最新のボード状態を取得
        const cells = window.getBoard?.();

        // 3. Canvas をクリアして描画
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#4ade80"; // 生存セルの色 (tailwind green-400)

        if (cells) {
          for (let i = 0; i < cells.length; i++) {
            if (cells[i] === 1) {
              const x = (i % WIDTH) * CELL_SIZE;
              const y = Math.floor(i / WIDTH) * CELL_SIZE;
              ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
            }
          }
        }

        requestRef.current = requestAnimationFrame(render);
      };

      requestRef.current = requestAnimationFrame(render);
    };

    void loadWasm();
  }, []);

  return (
    <main className="flex flex-col items-center p-6">
      <h1 className="mb-4 text-2xl font-bold">Go Wasm Conway's Game of Life</h1>

      <canvas
        ref={canvasRef}
        width={WIDTH * CELL_SIZE}
        height={HEIGHT * CELL_SIZE}
        className="rounded border border-gray-700 bg-gray-900 shadow-lg"
      />
    </main>
  );
}

export default App;
