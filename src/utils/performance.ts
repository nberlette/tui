import { $global } from "./primordials.ts";

export interface Performance {
  now(): number;
}

const globalTiming: Performance = $global.performance || $global.Date;

export const performance: Performance = {
  now: globalTiming.now.bind(globalTiming),
};
