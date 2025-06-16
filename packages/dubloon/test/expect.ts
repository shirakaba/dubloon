export function expectToBeNonNullable<T>(
  actual: T
): asserts actual is NonNullable<T> {
  expectToBeDefined(actual);
  expect(actual).not.toBeNull();
}

export function expectToBeDefined<T>(
  actual: T
): asserts actual is Exclude<T, undefined> {
  expect(actual).toBeDefined();
}
