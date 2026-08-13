export const PATH = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  TRANSCRIPTIONS: "/transcriptions",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export type AppPath = (typeof PATH)[keyof typeof PATH];


export enum API_QUERY_PARAM {
  LIMIT = "limit",
  CURSOR = "cursor",
}
