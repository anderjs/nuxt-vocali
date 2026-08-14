import type { NavigationMenuItem } from "@nuxt/ui";
import type { AuthUser } from "~/schemas/auth.schema";

export type ApiFetchRequest = Parameters<typeof $fetch>[0];
export type ApiFetchOptions = Parameters<typeof $fetch>[1];

export interface ApiClient {
  request<T>(path: ApiFetchRequest, options?: ApiFetchOptions): Promise<T>;
}

export type ClickEmit = {
  click: [];
};

export type LoginFormCardEmit<TCredentials> = {
  submit: [credentials: TCredentials];
  googleSignIn: [];
};

export type SignUpFormCardEmit<TCredentials, TConfirmation> = {
  submit: [credentials: TCredentials];
  confirm: [confirmation: TConfirmation];
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

export interface ListTranscriptionsParams {
  cursor?: string;
  limit: number;
}

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

export interface CognitoSignUpProfile {
  email: string;
  fullName: string;
}

export interface CognitoNameParts {
  familyName: string;
  formattedName: string;
  middleName: string;
}

export interface CognitoRequiredSignUpAttributes {
  [attribute: string]: string;

  email: string;
  family_name: string;
  gender: string;
  middle_name: string;
  name: string;
  picture: string;
  profile: string;
  updated_at: string;
}

export interface PcmAudioCapture {
  inputSource: MediaStreamAudioSourceNode;
  workletNode: AudioWorkletNode;
}
