<template>
    <div class="dark-theme">
        <FlowEditor />
    </div>
</template>
<script setup lang="ts">
import FlowEditor from './components/FlowEditor.vue'
</script>
<style>
.dark-theme {
    min-height: 100vh;
    background-color: #1a1a1a;
    color: #ffffff;
}

:root {
    /* Define dark theme variables */
    --background-primary: #1a1a1a;
    --background-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --border-color: #404040;
    --accent-color: #646cff;
}
</style>
