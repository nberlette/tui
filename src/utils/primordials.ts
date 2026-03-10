export const $global: typeof globalThis = (() => {
  try {
    return (0, eval)("this");
  } catch { /* nah */ }
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof globalThis !== "undefined") return globalThis;
  // deno-lint-ignore no-node-globals
  if (typeof global !== "undefined") return global;
  throw new Error("Unable to locate global object");
})();

const $O = $global.Object,
  $defs = $O.defineProperties,
  $gpds = $O.getOwnPropertyDescriptors;
// $create = $O.create,
// $def = $O.defineProperty,
// $gpd = $O.getOwnPropertyDescriptor,

export const SafeObject = $defs($O.bind($O), $gpds($O));

export const ObjectAssign = SafeObject.assign;
export const ObjectDefineProperty = SafeObject.defineProperty;
export const ObjectDefineProperties = SafeObject.defineProperties;
export const ObjectGetOwnPropertyDescriptor =
  SafeObject.getOwnPropertyDescriptor;
export const ObjectGetOwnPropertyDescriptors =
  SafeObject.getOwnPropertyDescriptors;
export const ObjectCreate = SafeObject.create;
