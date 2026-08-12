<template>
  <UFormField
    label="Contraseña"
    name="password"
    size="lg"
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
      required
      :ui="authPasswordInputUi"
    >
      <template #trailing>
        <button
          type="button"
          class="flex rounded-md p-1 text-text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          <UIcon
            :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </template>
    </UInput>
  </UFormField>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { authFormFieldUi, authPasswordInputUi } from "./form-ui";

const password = defineModel<string>({ required: true });
const showPassword = ref(false);

</script>
