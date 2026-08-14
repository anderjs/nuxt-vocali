<template>
  <UCard
    class="w-full max-w-md rounded-2xl bg-background shadow-sm ring-border"
    :ui="cardUi"
  >
    <AuthLogo
      class="mb-8 lg:hidden"
      label-class="text-lg font-semibold tracking-tight text-foreground"
    />

    <header class="mb-8">
      <h2 class="text-3xl font-semibold tracking-tight text-foreground">
        Iniciar sesión
      </h2>
      <p class="mt-3 leading-6 text-text-secondary">
        Accede a tu cuenta para continuar.
      </p>
    </header>

    <UAlert
      v-if="errorMessage"
      class="mb-5"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :description="errorMessage"
    />

    <UForm
      :schema="loginSchema"
      :state="form"
      class="space-y-5"
      @submit="handleSubmit"
    >
      <UFormField
        label="Correo electrónico"
        name="email"
        size="lg"
        required
        :ui="authFormFieldUi"
      >
        <UInput
          v-model="form.email"
          class="w-full"
          type="email"
          size="xl"
          color="primary"
          variant="outline"
          placeholder="correo@ejemplo.com"
          autocomplete="email"
          :ui="authInputUi"
        />
      </UFormField>

      <PasswordField v-model="form.password" />

      <div class="flex items-center justify-end">
        <UButton
          type="button"
          color="primary"
          variant="link"
          class="p-0 text-sm"
          label="¿Olvidaste tu contraseña?"
        />
      </div>

      <UButton
        type="submit"
        block
        size="xl"
        color="primary"
        class="h-12 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-primary"
      >
        Iniciar sesión
      </UButton>

      <UButton
        type="button"
        block
        size="xl"
        color="neutral"
        variant="outline"
        class="h-12 cursor-pointer rounded-xl border-border bg-background font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-purple-subtle hover:shadow-md focus-visible:outline-primary active:translate-y-0"
        @click="handleGoogleSignIn"
      >
        <span class="grid w-full grid-cols-[1fr_auto_1fr] items-center">
          <span aria-hidden="true" />
          <span class="flex items-center justify-center gap-3">
            <span>Continuar con Google</span>
            <span
              class="flex size-6 items-center justify-center rounded-full bg-background text-primary shadow-xs ring-1 ring-border"
              aria-hidden="true"
            >
              <UIcon name="i-vocali-google" class="size-4" />
            </span>
          </span>
          <span aria-hidden="true" />
        </span>
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-sm text-text-secondary">
      ¿No tienes una cuenta?
      <NuxtLink :to="PATH.SIGNUP" class="font-semibold text-primary">
        Crear cuenta
      </NuxtLink>
    </p>
  </UCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { LoginFormCardEmit } from "~/common/types";
import AuthLogo from "./AuthLogo.vue";
import PasswordField from "./PasswordField.vue";
import { authFormFieldUi, authInputUi } from "./form-ui";
import { loginSchema, type LoginSchema } from "~/schemas/login.schema";
import { PATH } from "~/utils/path";

defineProps<{
  errorMessage?: string;
}>();

const emit = defineEmits<LoginFormCardEmit<LoginSchema>>();

const cardUi = {
  body: "p-7 sm:p-9",
} as const;

const form = reactive<LoginSchema>({
  email: "",
  password: "",
});

function handleSubmit(event: FormSubmitEvent<LoginSchema>): void {
  emit("submit", event.data);
}

function handleGoogleSignIn(): void {
  emit("googleSignIn");
}
</script>
