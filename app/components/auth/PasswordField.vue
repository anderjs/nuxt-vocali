<template>
  <UFormField
    :label="label"
    :name="name"
    size="lg"
    required
    :ui="authFormFieldUi"
  >
    <UInput
      v-model="password"
      class="w-full"
      :type="showPassword ? 'text' : 'password'"
      size="xl"
      color="primary"
      variant="outline"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :ui="authPasswordInputUi"
    >
      <template #trailing>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="text-text-muted hover:text-primary"
          :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          @click="togglePasswordVisibility"
        />
      </template>
    </UInput>
  </UFormField>
</template>

<script setup lang="ts">
import { authFormFieldUi, authPasswordInputUi } from "./form-ui";

withDefaults(
  defineProps<{
    autocomplete?: string;
    label?: string;
    name?: string;
    placeholder?: string;
  }>(),
  {
    autocomplete: "current-password",
    label: "Contraseña",
    name: "password",
    placeholder: "Introduce tu contraseña",
  },
);

const password = defineModel<string>({ required: true });
const showPassword = ref(false);

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value;
}
</script>
