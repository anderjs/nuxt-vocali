import { fetchAuthSession } from "aws-amplify/auth";

export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  const session = await fetchAuthSession({ forceRefresh });

  return session.tokens?.accessToken?.toString() ?? null;
}
