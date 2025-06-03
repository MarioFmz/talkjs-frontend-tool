<script setup lang="ts">
import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/vue' 
</script>
<template>
  <div>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
    <SignedIn>
      <div class="app-content">
        <div class="user-button-container">
          <UserButton />
        </div>
        <router-view></router-view>
      </div>
    </SignedIn>
  </div>
</template>

<style scoped>
.app-content {
  position: relative;
}

.user-button-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
