<template>
  <main class="min-h-dvh bg-surface-purple-subtle">
    <div
      class="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(400px,448px)] lg:gap-20 lg:px-12"
    >
      <LoginBrandPanel />

      <section class="flex w-full justify-center lg:justify-end">
        <SignUpFormCard
          :error-message="signUpError"
          :is-confirming="isConfirming"
          :loading="isSubmitting"
          :success-message="signUpSuccess"
          @confirm="handleConfirmSignUp"
          @submit="handleSignUp"
        />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import SignUpFormCard from "~/components/auth/SignUpFormCard.vue";
import LoginBrandPanel from "~/components/auth/LoginBrandPanel.vue";
import type {
  SignUpSchema,
  ConfirmSignUpSchema,
} from "~/schemas/signup.schema";
import { PATH } from "~/utils/path";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const registeredEmail = ref<string>();
const signUpError = ref<string | null>(null);
const signUpSuccess = ref<string | null>(null);
const isConfirming = ref(false);
const isSubmitting = ref(false);

definePageMeta({ middleware: "guest" });

const handleSignUp = async ({ email, fullName, password }: SignUpSchema) => {
  isSubmitting.value = true;
  signUpError.value = null;
  signUpSuccess.value = null;

  try {
    await authStore.signUp(email, password, fullName);
    isConfirming.value = true;
    registeredEmail.value = email;
    signUpSuccess.value = "Cuenta creada. Revisa tu correo para confirmarla.";
  } catch {
    signUpError.value =
      "No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleConfirmSignUp = async ({
  confirmationCode,
}: ConfirmSignUpSchema) => {
  if (!registeredEmail.value) {
    signUpError.value = "Vuelve a iniciar el registro.";
    return;
  }

  signUpError.value = null;

  isSubmitting.value = true;

  try {
    await authStore.confirmSignUp(registeredEmail.value, confirmationCode);

    await navigateTo(PATH.LOGIN);
  } catch {
    signUpError.value =
      "No pudimos confirmar tu cuenta. Revisa el código e inténtalo de nuevo.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
