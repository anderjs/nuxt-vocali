import { userManager } from "~/config/config";

type IUser = {
  email: string | null;
  given_name: string | null;
};

export const useAuthStore = defineStore("authStore", {
  state: () =>
    ({
      email: null,
      given_name: null,
    }) as IUser,
  actions: {
    async signIn() {
      userManager.signinPopup();
    },
    async logout() {
      userManager.signoutRedirect();
    },
  },
});
