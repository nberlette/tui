// Copyright 2023 Im-Beast. MIT license.
import type { Dependency, Dependish } from "./types.ts";

export let activeSignals: Set<Dependency> | undefined;
let incoming = 0;

/**
 * Asynchronously tracks used signals for provided function
 */
export async function track<T extends Dependish>(
  dependencies: Set<T>,
  thisArg: unknown,
  // this is supposed to mean every function
  // deno-lint-ignore ban-types
  func: Function,
): Promise<void> {
  while (incoming) await Promise.resolve();

  ++incoming;
  activeSignals = dependencies;

  try {
    func.call(thisArg);
  } catch (error) {
    incoming = 0;
    throw error;
  } finally {
    activeSignals = undefined;
    --incoming;
  }
}

/**
 * Replaces all dependencies with root dependencies to prevent multiple updates caused by the same change.
 */
export function optimize<T extends Dependish>(
  into: Set<T>,
  from: Iterable<T> = into,
): void {
  for (const dependency of from) {
    if ("dependencies" in dependency) {
      into.delete(dependency);
      optimize(into, dependency.dependencies);
    } else {
      into.add(dependency);
    }
  }
}

export { optimize as optimizeDependencies, track as trackDependencies };
