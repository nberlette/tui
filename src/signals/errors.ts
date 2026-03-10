/** Thrown whenever someone tries to directly modify `Computed.value` */
export class ComputedReadOnlyError extends Error {
  constructor() {
    super(
      "Computed values are read-only and cannot be directly modified. If you need to change the value, change the signals it depends on instead."
    );
    this.name = "ComputedReadOnlyError";
  }
}

/** Thrown whenever `deepObserve` is set and `typeof value !== "object"` */
export class SignalDeepObserveTypeofError extends Error {
  constructor() {
    super("You can only deeply observe value with typeof 'object'");
    this.name = "SignalDeepObserveTypeofError";
  }
}
