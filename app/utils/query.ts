/**
 * @description
 * Query value.
 */
export function getQueryValue(
  value: string | null | (string | null)[] | undefined,
  index: number = 0,
): string | undefined {
  const firstValue = Array.isArray(value) ? value[index] : value;

  return firstValue ?? undefined;
}
