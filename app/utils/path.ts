export const PATH = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  TRANSCRIPTIONS: "/transcriptions",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export type AppPath = (typeof PATH)[keyof typeof PATH];

export const API_PATH = {
  TRANSCRIPTIONS: "/transcriptions",
} as const;

export type ApiPath = (typeof API_PATH)[keyof typeof API_PATH];
