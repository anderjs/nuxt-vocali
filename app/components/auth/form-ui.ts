export const authFormFieldUi = {
  label: "text-sm font-semibold text-foreground",
  container: "mt-2",
} as const;

export const authInputUi = {
  root: "w-full",
  base: "h-12 rounded-xl bg-background px-4 text-foreground ring-border placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary",
} as const;

export const authPasswordInputUi = {
  ...authInputUi,
  trailing: "pe-3",
} as const;
