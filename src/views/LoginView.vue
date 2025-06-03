<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="login-container">
    <SignIn />
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

</style> 