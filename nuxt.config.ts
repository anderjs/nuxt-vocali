import tailwindcss from "@tailwindcss/vite";
import { createResolver } from "nuxt/kit";
import { defineNuxtConfig } from "nuxt/config";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ["animate.css", "~/assets/main.css"],
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  icon: {
    customCollections: [
      {
        prefix: "vocali",
        dir: resolve("./app/assets/icons"),
      },
    ],
  },
  runtimeConfig: {
    public: {
      apiBase: "/api/v1",
      cognitoAuthority: process.env.NUXT_PUBLIC_COGNITO_AUTHORITY ?? process.env.COGNITO_AUTHORITY ?? "",
      cognitoClientId: process.env.NUXT_PUBLIC_COGNITO_CLIENT_ID ?? process.env.COGNITO_CLIENT_ID ?? "",
      cognitoRedirectUri:
        process.env.NUXT_PUBLIC_COGNITO_REDIRECT_URI ??
        process.env.COGNITO_REDIRECT_URI ??
        "http://localhost:3000/auth/callback",
      cognitoLogoutRedirectUri:
        process.env.NUXT_PUBLIC_COGNITO_LOGOUT_REDIRECT_URI ??
        process.env.COGNITO_LOGOUT_REDIRECT_URI ??
        "http://localhost:3000/login",
      cognitoScope:
        process.env.NUXT_PUBLIC_COGNITO_SCOPE ??
        process.env.COGNITO_SCOPE ??
        "openid email profile",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  routeRules: {
    "/": { redirect: "/login" },
  },
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
});
