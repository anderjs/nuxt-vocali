<template>
  <UFormField
    label="Contraseña"
    name="password"
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
      placeholder="Introduce tu contraseña"
      autocomplete="current-password"
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

const password = defineModel<string>({ required: true });
const showPassword = ref(false);

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value;
}
</script>
