<template>
  <NuxtLayout>
    <NuxtPage />
    <ToastContainer ref="toastContainerRef" />
  </NuxtLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useToast } from "./composables/useToast";

const toastContainerRef = ref(null);
const toast = useToast();

onMounted(() => {
  toast.setContainer(toastContainerRef.value);
});
</script>
