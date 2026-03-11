// Copyright 2023 Im-Beast. MIT license.

export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Creates array that automatically sorts elements using `compareFn`
 * Additionally allows for removing elements
 */
export class SortedArray<T = unknown> extends Array<T> {
  compareFn?: CompareFn<T>;

  constructor(compareFn?: CompareFn<T>, ...items: T[]) {
    super(...items);
    this.compareFn = compareFn;
  }

  override push(...items: T[]): number {
    super.push(...items);
    return this.sort().length;
  }

  override unshift(...items: T[]): number {
    super.unshift(...items);
    return this.sort().length;
  }

  override reverse(): this {
    super.reverse();
    return this.sort(this.compareFn);
  }

  override splice(start: number, deleteCount?: number): T[];
  override splice(start: number, deleteCount: number, ...items: T[]): T[];
  override splice(
    start: number,
    deleteCount?: number,
    ...items: T[]
  ): T[] {
    // sort before and after to maintain order in the removed subsequence too
    this.sort();
    const removed = super.splice(start, deleteCount ?? this.length, ...items);
    this.sort();
    return removed;
  }

  override copyWithin(
    target: number,
    start: number,
    end?: number,
  ): this {
    return super.copyWithin(target, start, end).sort(this.compareFn);
  }

  override sort<This = void>(
    compareFn?: (this: This, a: T, b: T) => number,
    thisArg?: This,
  ): this {
    compareFn ??= this.compareFn;
    if (thisArg) compareFn = compareFn?.bind(thisArg);
    return super.sort(compareFn), this;
  }

  override fill(value: T, start?: number, end?: number): this {
    return super.fill(value, start, end).sort(this.compareFn);
  }

  remove(...items: T[]): number {
    for (const item of items) {
      this.splice(this.indexOf(item), 1);
    }
    return this.length;
  }
}
