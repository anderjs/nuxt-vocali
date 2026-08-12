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

    <UForm :state="form" class="space-y-5" @submit="emit('submit')">
      <UFormField
        label="Correo electrónico"
        name="email"
        size="lg"
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
          required
          :ui="authInputUi"
        />
      </UFormField>

      <PasswordField v-model="form.password" />

      <div class="flex items-center justify-end">
        <button
          type="button"
          class="text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ¿Olvidaste tu contraseña?
        </button>
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
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import AuthLogo from "./AuthLogo.vue";
import PasswordField from "./PasswordField.vue";
import { authFormFieldUi, authInputUi } from "./form-ui";

type Emit = {
  submit: [];
};

type LoginForm = {
  email: string;
  password: string;
};

const emit = defineEmits<Emit>();

const cardUi = {
  body: "p-7 sm:p-9",
} as const;

const form = reactive<LoginForm>({
  email: "",
  password: "",
});
</script>
