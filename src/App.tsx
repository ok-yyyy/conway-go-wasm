import { useEffect, useRef } from "react";

const BOARD_WIDTH = 150;
const BOARD_HEIGHT = 150;
const ALIVE_COLOR = "#000000";
const STEP_INTERVAL_MS = 50;

const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT;

declare global {
  interface Window {
    initBoard?: (w: number, h: number) => void;
    step?: () => void;
    fillBoard?: (dst: Uint8Array) => void;
  }
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  cells: Uint8Array,
  width: number,
) {
  ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  ctx.fillStyle = ALIVE_COLOR;

  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index] !== 1) {
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    ctx.fillRect(x, y, 1, 1);
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef(new Uint8Array(BOARD_SIZE));

  const handleReset = () => {
    window.initBoard?.(BOARD_WIDTH, BOARD_HEIGHT);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cancelled = false;
    let frameId = 0;
    let lastStepAt = 0;

    const render = (now: number) => {
      if (cancelled) return;

      if (now - lastStepAt > STEP_INTERVAL_MS) {
        window.step?.();
        lastStepAt = now;
      }

      window.fillBoard?.(cellsRef.current);
      drawBoard(ctx, cellsRef.current, BOARD_WIDTH);

      frameId = requestAnimationFrame(render);
    };

    const start = () => {
      if (cancelled) return;

      if (!window.initBoard || !window.step || !window.fillBoard) {
        frameId = requestAnimationFrame(start);
        return;
      }

      window.initBoard(BOARD_WIDTH, BOARD_HEIGHT);
      frameId = requestAnimationFrame(render);
    };

    console.log("Starting animation loop");
    frameId = requestAnimationFrame(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <main className="flex flex-col items-center p-6">
      <h1 className="mb-4 text-2xl font-bold">Go Wasm Conway's Game of Life</h1>

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        style={{ imageRendering: "pixelated" }}
        className="block h-auto w-[92vw] max-w-[320px] border border-gray-300 bg-white sm:max-w-[420px] md:max-w-[560px] lg:max-w-[720px] xl:max-w-[800px]"
      />

      <button
        type="button"
        onClick={handleReset}
        className="mt-4 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
      >
        Reset
      </button>
    </main>
  );
}

export default App;
