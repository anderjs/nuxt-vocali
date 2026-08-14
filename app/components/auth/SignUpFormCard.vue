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
        {{ isConfirming ? "Confirma tu cuenta" : "Crear cuenta" }}
      </h2>
      <p class="mt-3 leading-6 text-text-secondary">
        {{
          isConfirming
            ? "Introduce el código que enviamos a tu correo."
            : "Regístrate para comenzar a usar Vocali."
        }}
      </p>
    </header>

    <UAlert
      v-if="successMessage"
      class="mb-5"
      color="primary"
      variant="soft"
      icon="i-lucide-circle-check"
      :description="successMessage"
    />

    <UAlert
      v-if="errorMessage"
      class="mb-5"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :description="errorMessage"
    />

    <UForm
      v-if="!isConfirming"
      :schema="signUpSchema"
      :state="form"
      class="space-y-5"
      @submit="handleSubmit"
    >
      <UFormField
        label="Nombre completo"
        name="fullName"
        size="lg"
        required
        :ui="authFormFieldUi"
      >
        <UInput
          v-model="form.fullName"
          class="w-full"
          type="text"
          size="xl"
          color="primary"
          variant="outline"
          placeholder="Tu nombre"
          autocomplete="name"
          :ui="authInputUi"
        />
      </UFormField>

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

      <PasswordField v-model="form.password" autocomplete="new-password" />

      <PasswordField
        v-model="form.confirmPassword"
        autocomplete="new-password"
        label="Confirmar contraseña"
        name="confirmPassword"
        placeholder="Repite tu contraseña"
      />

      <UButton
        type="submit"
        block
        size="xl"
        color="primary"
        :loading="loading"
        class="h-12 cursor-pointer rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-primary"
      >
        Crear cuenta
      </UButton>
    </UForm>

    <UForm
      v-else
      :schema="confirmSignUpSchema"
      :state="confirmationForm"
      class="space-y-5"
      @submit="handleConfirm"
    >
      <UFormField
        label="Código de confirmación"
        name="confirmationCode"
        size="lg"
        required
        :ui="authFormFieldUi"
      >
        <UInput
          v-model="confirmationForm.confirmationCode"
          class="w-full"
          type="text"
          inputmode="numeric"
          size="xl"
          color="primary"
          variant="outline"
          placeholder="Introduce el código"
          autocomplete="one-time-code"
          :ui="authInputUi"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="xl"
        color="primary"
        :loading="loading"
        class="h-12 cursor-pointer rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-primary"
      >
        Confirmar cuenta
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-sm text-text-secondary">
      ¿Ya tienes una cuenta?
      <NuxtLink :to="PATH.LOGIN" class="font-semibold text-primary">
        Inicia sesión
      </NuxtLink>
    </p>
  </UCard>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { SignUpFormCardEmit } from "~/common/types";
import {
  confirmSignUpSchema,
  signUpSchema,
  type ConfirmSignUpSchema,
  type SignUpSchema,
} from "~/schemas/signup.schema";
import { PATH } from "~/utils/path";
import AuthLogo from "./AuthLogo.vue";
import PasswordField from "./PasswordField.vue";
import { authFormFieldUi, authInputUi } from "./form-ui";

defineProps<{
  errorMessage?: string | null;
  isConfirming?: boolean;
  loading?: boolean;
  successMessage?: string | null;
}>();

const emit = defineEmits<SignUpFormCardEmit<SignUpSchema, ConfirmSignUpSchema>>();

const cardUi = {
  body: "p-7 sm:p-9",
} as const;

const form = reactive<SignUpSchema>({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const confirmationForm = reactive<ConfirmSignUpSchema>({
  confirmationCode: "",
});

function handleSubmit(event: FormSubmitEvent<SignUpSchema>): void {
  emit("submit", event.data);
}

function handleConfirm(event: FormSubmitEvent<ConfirmSignUpSchema>): void {
  emit("confirm", event.data);
}
</script>
