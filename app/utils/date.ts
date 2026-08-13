const shortDateFormatterEs = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatShortDateEs(value: string): string {
  return shortDateFormatterEs.format(new Date(value));
}
