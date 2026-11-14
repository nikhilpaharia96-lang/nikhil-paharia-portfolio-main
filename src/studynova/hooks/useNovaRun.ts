import { useCallback, useEffect, useRef, useState } from "react";
import { DEMOS, matchDemo, type DemoId } from "../data/demos";

export type Phase = "idle" | "running" | "done";
export interface RunState {
  phase: Phase;
  step: number;        // 1..5 (Understanding, Planning, Selecting tools, Processing, Completed)
  demo: DemoId | null;
  prompt: string;
  exact: boolean;      // prompt was one of the pre-built examples
  understood: number;  // lines revealed in step 1
  planShown: number;   // plan items revealed in step 2
  toolsShown: number;  // tools revealed in step 3
  taskIndex: number;   // current processing task
  taskPct: number;     // 0..100 of the current task
  overall: number;     // 0..100
}

const IDLE: RunState = { phase: "idle", step: 0, demo: null, prompt: "", exact: true, understood: 0, planShown: 0, toolsShown: 0, taskIndex: -1, taskPct: 0, overall: 0 };
class Cancelled extends Error {}

/**
 * Scripted "Nova Brain" simulation. It only animates pre-built data — no model is called.
 * `speed` < 1 makes it faster (e.g. 0.4 for a quick live demo).
 */
export function useNovaRun(speed = 1) {
  const [s, setS] = useState<RunState>(IDLE);
  const token = useRef(0);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const k = reduced ? 0.25 : speed;

  useEffect(() => () => { token.current++; }, []);

  const run = useCallback(async (prompt: string, forced?: DemoId) => {
    const my = ++token.current;
    const wait = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (token.current === my ? res() : rej(new Cancelled())), ms * k));
    const m = forced ? { id: forced, exact: true } : matchDemo(prompt);
    const d = DEMOS[m.id];
    const set = (p: Partial<RunState>) => { if (token.current === my) setS((x) => ({ ...x, ...p })); };
    try {
      setS({ ...IDLE, phase: "running", step: 1, demo: m.id, prompt: prompt || d.prompt, exact: m.exact });
      for (let i = 1; i <= d.understanding.length; i++) { await wait(380); set({ understood: i }); }
      await wait(450);
      set({ step: 2 });
      for (let i = 1; i <= d.plan.length; i++) { await wait(260); set({ planShown: i }); }
      await wait(450);
      set({ step: 3 });
      for (let i = 1; i <= d.tools.length; i++) { await wait(380); set({ toolsShown: i }); }
      await wait(500);
      set({ step: 4 });
      const total = d.tasks.reduce((a, t) => a + t.ms, 0);
      let doneMs = 0;
      for (let i = 0; i < d.tasks.length; i++) {
        const t = d.tasks[i];
        for (let p = 0; p <= 10; p++) {
          set({ taskIndex: i, taskPct: p * 10, overall: Math.round(((doneMs + (t.ms * p) / 10) / total) * 100) });
          if (p < 10) await wait(t.ms / 10);
        }
        doneMs += t.ms;
      }
      await wait(350);
      set({ step: 5, phase: "done", overall: 100, taskIndex: d.tasks.length });
    } catch (e) { if (!(e instanceof Cancelled)) throw e; }
  }, [k]);

  /** Jump straight to the finished result. */
  const skip = useCallback(() => {
    setS((x) => {
      if (!x.demo) return x;
      token.current++;
      const d = DEMOS[x.demo];
      return { ...x, phase: "done", step: 5, understood: d.understanding.length, planShown: d.plan.length, toolsShown: d.tools.length, taskIndex: d.tasks.length, taskPct: 100, overall: 100 };
    });
  }, []);

  const reset = useCallback(() => { token.current++; setS(IDLE); }, []);
  return { state: s, run, skip, reset };
}
