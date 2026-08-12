import {
  UserManager,
  WebStorageStateStore,
  type User,
  type UserManagerSettings,
} from "oidc-client-ts";
import { useRuntimeConfig } from "#imports";

let userManager: UserManager | null = null;

export function getUserManager(): UserManager {
  if (userManager) {
    return userManager;
  }

  const runtimeConfig = useRuntimeConfig();

  const publicConfig = runtimeConfig.public;

  const settings: UserManagerSettings = {
    response_type: "code",
    client_id: publicConfig.cognitoClientId,
    authority: publicConfig.cognitoAuthority,
    redirect_uri: publicConfig.cognitoRedirectUri,
    post_logout_redirect_uri: publicConfig.cognitoLogoutRedirectUri,
    scope: publicConfig.cognitoScope || "openid email profile",
  };

  if (import.meta.client) {
    settings.userStore = new WebStorageStateStore({
      store: window.localStorage,
    });
  }

  userManager = new UserManager(settings);

  return userManager;
}

export async function getAuthenticatedSession(): Promise<User | null> {
  return await getUserManager().getUser();
}
