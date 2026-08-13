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
