<script setup lang="ts">
import { PATH } from "~/utils/path";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
  redirect: PATH.TRANSCRIPTIONS,
});
</script>
