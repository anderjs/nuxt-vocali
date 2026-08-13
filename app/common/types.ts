import type { NavigationMenuItem } from "@nuxt/ui";
import type { AuthUser } from "~/schemas/auth.schema";

export type ClickEmit = {
  click: [];
};

export type LoginFormCardEmit<TCredentials> = {
  submit: [credentials: TCredentials];
  googleSignIn: [];
};

export type NavigationEmit = {
  navigate: [];
};

export type OpenNavigationEmit = {
  "open-navigation": [];
};

export type TranscriptionsTableEmit = {
  next: [cursor: string];
};

export type AuthIdentityUser = Pick<AuthUser, "email" | "username">;

export type QueryValue = string | null | (string | null)[] | undefined;

export type OAuthCallbackLocation = Pick<Location, "pathname" | "search">;

export type UnauthorizedErrorCandidate = {
  status?: number;
  statusCode?: number;
  response?: {
    status?: number;
  };
};

export type SidebarNavigationItemUi = NonNullable<NavigationMenuItem["ui"]>;
