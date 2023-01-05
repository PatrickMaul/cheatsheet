<template lang="pug">
nav.link-section-wrapper
    .link-section(v-for="section in indexedDocsDirectory")
        h4.link-section-title {{section.title}}
        ul.link-section-links
            li.link.pointer.text-ellipsis(v-for="link in section.links", @click="setPathInURL(link.path)") {{link.title}}
</template>

<script setup>
// List with indexed docs directory, file will be automatically updated with a GitHub Action.
import indexedDocsDirectory from "@/assets/json/indexed_docs_directory.json";
// Defining emits
const emit = defineEmits(["pathUpdated"]);

function setPathInURL(path) {
    window.history.replaceState(null, document.title, `?path=${path}`);
    emit("pathUpdated");
}
</script>

<style lang="scss" scoped>
.link-section-wrapper {
    height: calc(100vh - $cs-nd-subtrahend);
    overflow-y: auto;
    .link-section {
        .link-section-title {
            margin: 1rem 0 0 0;
        }
        .link-section-links {
            margin: 0;
            overflow: hidden;
            padding-left: 16px;
            list-style-type: none;
        }
    }
}
</style>
