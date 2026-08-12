import type { User } from "oidc-client-ts";
import type { AuthUser } from "~/schemas/auth.schema";
import { authUserSchema } from "~/schemas/auth.schema";

export function mapOidcUser(user: User | null): AuthUser | null {
  if (!user || user.expired) {
    return null;
  }

  return authUserSchema.parse({
    sub: user.profile?.sub ?? null,
    name: user.profile?.name ?? null,
    email: user.profile?.email ?? null,
    picture: user.profile?.picture ?? null,
    givenName: user.profile?.given_name ?? null,
  });
}
