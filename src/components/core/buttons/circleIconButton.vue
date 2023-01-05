<template lang="pug">
button.circle-icon-button.flex.pointer(:title="tooltip")
    span.material-symbols-outlined {{ icon }}
</template>

<script setup>
defineProps(["icon", "tooltip", "iconSizeClass"]);
</script>

<style lang="scss" scoped>
button.circle-icon-button {
    min-width: 40px;
    aspect-ratio: 1/1;

    background-color: #00000000;
    color: inherit;
    border: none;
    border-radius: 2rem;

    span.material-symbols-outlined {
        margin: auto;
        font-size: 2rem;
    }
}
</style>
