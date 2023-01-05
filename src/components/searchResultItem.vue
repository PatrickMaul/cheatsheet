<template lang="pug">
li.result-item.pointer.flex.column(@click="$emit('updatePath', result.path)")
    .result-item-header
        p.result-item-title(v-html="result.highlighted.title ? result.highlighted.title : result.title")
    .result-item-content
        p.result-item-description(v-html="result.highlighted.description ? result.highlighted.description : result.description")
        p.result-item-keywords
            .chip(v-for="key in result.highlighted.keywords ? result.highlighted.keywords : result.keywords", v-html="key")
</template>

<script setup>
defineProps(["result"]);
defineEmits(["updatePath"]);
</script>

<style lang="scss">
.result-item {
    border: 2px solid $cs-primary-color;
    border-radius: 3px;
    padding: $cs-padding;
    margin: 0 0 $cs-padding 0;
    position: relative;

    .result-item-header {
        .result-item-title {
            margin: 0;
            margin: 0 0 $cs-padding 0;
            font-size: 18px;
            font-weight: 600;
        }
    }

    .result-item-content {
        .result-item-description {
            margin: 0;
            max-width: 73%;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 14px;
            font-weight: 300;
            color: #444444;
        }
        .result-item-keywords {
            margin: 0;
            max-width: 25%;
            overflow: hidden;
            overflow-x: auto;
            position: absolute;
            bottom: $cs-padding;
            right: $cs-padding;
            font-size: 12px;
            display: flex;
            gap: 4px;

            .chip {
                background-color: $cs-primary-color;
                padding: 4px 8px;
                border-radius: 1rem;
                text-align: center;
                white-space: nowrap;
                width: max-content;
                color: $cs-white;
            }
        }
    }

    .fuzzy-highlight {
        text-decoration: underline !important;
    }
}
</style>
