// TODO: remove this and switch to native JavaScript `flatMap` once Node 12 is the minimum version we need to support.
export function flatMap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (item: any, index: number) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return array.reduce(
    (result, item, index) => result.concat(callback(item, index)), // eslint-disable-line unicorn/prefer-spread
    []
  );
}
