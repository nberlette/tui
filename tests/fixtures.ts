import { Canvas } from "../src/canvas/canvas.ts";
import { EventEmitter } from "../src/event_emitter.ts";
import { Signal } from "../src/signals/signal.ts";

const textDecoder = new TextDecoder();

export function flush(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve());
}

export function identityStyle(text: string): string {
  return text;
}

export function createRecordingStdout() {
  const writes: string[] = [];

  return {
    writes,
    stdout: {
      writeSync(chunk: Uint8Array): number {
        writes.push(textDecoder.decode(chunk));
        return chunk.byteLength;
      },
      write(chunk: Uint8Array): Promise<number> {
        return Promise.resolve(this.writeSync(chunk));
      },
      close(): void {},
      isTerminal(): boolean {
        return false;
      },
      writable: new WritableStream<Uint8Array>({
        write(chunk) {
          writes.push(textDecoder.decode(chunk));
        },
      }),
    },
  };
}

export function createCanvas(size = { columns: 12, rows: 6 }) {
  const { stdout, writes } = createRecordingStdout();
  return {
    writes,
    stdout,
    canvas: new Canvas({ stdout, size }),
  };
}

export function createFakeRoot(size = { columns: 12, rows: 6 }) {
  const { canvas, stdout, writes } = createCanvas(size);
  const root = new EventEmitter() as EventEmitter<Record<string, never>> & {
    tui: unknown;
    canvas: Canvas;
    stdout: typeof stdout;
    stdin: { setRaw: () => void };
    children: unknown[];
    components: Set<unknown>;
    drawnObjects: Record<string, unknown>;
    refreshRate: number;
    rectangle: Signal<
      { column: number; row: number; width: number; height: number }
    >;
    addChild(child: unknown): unknown;
    hasChild(child: unknown): boolean;
  };

  root.tui = root;
  root.canvas = canvas;
  root.stdout = stdout;
  root.stdin = { setRaw() {} };
  root.children = [];
  root.components = new Set();
  root.drawnObjects = {};
  root.refreshRate = 16;
  root.rectangle = new Signal({
    column: 0,
    row: 0,
    width: size.columns,
    height: size.rows,
  }, { deepObserve: true });
  root.addChild = function (child: unknown) {
    this.children.push(child);
    this.components.add(child);
    if (
      (child as { visible?: { peek(): boolean }; draw?: () => void }).visible
        ?.peek()
    ) {
      (child as { draw?: () => void }).draw?.();
    }
    return this;
  };
  root.hasChild = function (child: unknown): boolean {
    return this.components.has(child);
  };

  return { root, canvas, stdout, writes };
}
