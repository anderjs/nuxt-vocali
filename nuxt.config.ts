import tailwindcss from "@tailwindcss/vite";
import { createResolver } from "nuxt/kit";
import { defineNuxtConfig } from "nuxt/config";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ["~/assets/main.css"],
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
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE_URL ??
        process.env.API_BASE_URL ??
        "/api/v1",
      cognitoUserPoolId:
        process.env.NUXT_PUBLIC_COGNITO_USER_POOL_ID ??
        process.env.COGNITO_USER_POOL_ID ??
        "",
      cognitoClientId:
        process.env.NUXT_PUBLIC_COGNITO_CLIENT_ID ??
        process.env.COGNITO_CLIENT_ID ??
        "",
      cognitoDomain:
        process.env.NUXT_PUBLIC_COGNITO_DOMAIN ??
        process.env.COGNITO_DOMAIN ??
        "",
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
        "openid email profile aws.cognito.signin.user.admin",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  routeRules: {
    "/": { redirect: "/login" },
    "/dashboard": { ssr: false },
    "/transcriptions/**": { ssr: false },
    "/transcribe/**": { ssr: false },
  },
  devtools: { enabled: process.env.NODE_ENV === "development" },
  compatibilityDate: "2025-07-15",
});
