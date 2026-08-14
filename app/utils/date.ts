const shortDateFormatterEs = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatShortDateEs(value: string): string {
  return shortDateFormatterEs.format(new Date(value));
}

const timeFormatterEs = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const compactDateTimeFormatterEs = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

/** Formats a refresh time in a human-readable Spanish form for the UI. */
export function formatLastUpdatedEs(value: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === value.toDateString();

  if (isToday) {
    return `Hoy, ${timeFormatterEs.format(value)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (yesterday.toDateString() === value.toDateString()) {
    return `Ayer, ${timeFormatterEs.format(value)}`;
  }

  return compactDateTimeFormatterEs.format(value);
}
