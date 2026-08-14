import type {
  FileInputUi,
  NewTranscriptionModalUi,
} from "~/common/types";

export const newTranscriptionModalUi = {
  content: "bg-background text-foreground divide-border ring-border",
  title: "text-foreground",
  description: "text-text-secondary",
  close: "cursor-pointer text-text-muted hover:bg-surface-purple-subtle hover:text-foreground",
  body: "bg-background",
  footer: "bg-background",
} satisfies NewTranscriptionModalUi;

export const audioFileInputUi = {
  root: "w-full",
  base: [
    "h-11 cursor-pointer rounded-lg bg-background text-foreground ring-1 ring-inset ring-border",
    "file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-purple-subtle file:px-3 file:py-1.5 file:font-medium file:text-primary",
    "hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-surface-purple-subtle disabled:text-text-muted",
  ].join(" "),
} satisfies FileInputUi;

export const selectedAudioFileCardClass = [
  "flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 shadow-sm",
  "text-foreground",
].join(" ");


export const selectedAudioFileMetaClass =
  "flex min-w-0 flex-1 items-center justify-between gap-4";

export const selectedAudioFileRemoveButtonClass =
  "cursor-pointer text-text-muted hover:bg-surface-purple-subtle hover:text-foreground";
