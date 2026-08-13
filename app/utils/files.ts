export function getFirstInputFile(event: Event): File | null {
  const input = event.target;

  if (!(input instanceof HTMLInputElement)) {
    return null;
  }

  return input.files?.item(0) ?? null;
}
