import { defineStore } from "pinia";
import { getAuthenticatedSession, getUserManager } from "~/config/config";
import { type AuthState } from "~/schemas/auth.schema";

export const useAuthStore = defineStore("authStore", {
  state: (): AuthState => ({
    user: null,
    loading: false,
    authenticated: false,
  }),

  actions: {
    async loadSession() {
      this.loading = true;

      try {
        const session = await getAuthenticatedSession();

        const user = mapOidcUser(session);

        if (user) {
          this.user = user;

          this.authenticated = true;
        }
      } finally {
        this.loading = false;
      }
    },

    async signIn() {
      await getUserManager().signinRedirect();
    },

    async signInWithGoogle() {
      await getUserManager().signinRedirect({
        extraQueryParams: {
          identity_provider: "Google",
        },
      });
    },

    async handleSigninCallback() {
      this.loading = true;

      try {
        const session = await getUserManager().signinRedirectCallback();

        const user = mapOidcUser(session);

        this.user = user;

        this.authenticated = Boolean(user);
      } finally {
        this.loading = false;
      }
    },

    async getAccessToken() {
      const session = await getAuthenticatedSession();
      return session && !session.expired ? session.access_token : null;
    },

    async getIdToken() {
      const session = await getAuthenticatedSession();
      return session && !session.expired ? session.id_token : null;
    },

    async getCurrentCognitoUser() {
      return await getAuthenticatedSession();
    },

    async logout() {
      await getUserManager().signoutRedirect();
    },
  },
});
