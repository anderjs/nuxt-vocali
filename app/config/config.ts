import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
  client_id: import.meta.env.COGNITO_CLIENT_ID,
  authority: import.meta.env.COGNITO_AUTHORITY,
  redirect_uri: import.meta.env.COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: "phone openid email",
};

export const userManager = new UserManager({
  ...cognitoAuthConfig,
});
