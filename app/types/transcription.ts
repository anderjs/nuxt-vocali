export type TranscriptionType = "file" | "realtime";
export type TranscriptionStatus = "completed" | "processing" | "error";

export interface TranscriptionListItem {
  id: string;
  name: string;
  type: TranscriptionType;
  status: TranscriptionStatus;
  createdAt: string;
}

export interface TranscriptionPage {
  items: TranscriptionListItem[];
  nextCursor: string | null;
}
