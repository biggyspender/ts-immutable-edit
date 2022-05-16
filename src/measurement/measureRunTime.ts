import { performance } from 'perf_hooks';

export function measureRunTime(iters: number, f: () => void) {
  for (let i = 0; i < 10; ++i) {
    f();
  }
  const start = performance.now();
  for (let i = 0; i < iters; ++i) {
    f();
  }
  const end = performance.now();
  return {
    runTime: Math.round(end - start),
    invocationsPerSecond: Math.round((iters * 1000) / (end - start)),
  };
}
