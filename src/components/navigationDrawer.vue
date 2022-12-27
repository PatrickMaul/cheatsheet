<template lang="pug">
#navigation-drawer(:class="{'active':props.activeNavigation}", @click.self="closeNavigation")
    .content-wrapper.flex
        p.inactive-msg.pointer(v-if="!props.activeNavigation", @click="emit('update:activeNavigation', true)") Click to open navigation bar

        .inner-wrapper.flex.column(v-show="props.activeNavigation")
            h2.nav-title.pointer(@click="resetURLState") Cheat sheet
            primary-button.search-btn(label="Open search", icon-left="search", @click="emit('update:activeSearch', true)")
            navigation-list(@path-updated="emitPath")
            .flex-filler
            primary-button.theme-switch-btn(label="Switch theme", icon-right="brightness_4", icon-left="brightness_4", @click="emit('update:appTheme')")
            primary-button.collapse-navigation-btn(label="Collapse navigation", icon-left="keyboard_double_arrow_left", icon-right="keyboard_double_arrow_left", @click="closeNavigation")
            .legals.flex
                a(href="?path=src/docs/imprint.md") Imprint
</template>

<script setup>
// Components
import navigationList from "./navigationList.vue";
import primaryButton from "./core/buttons/primaryButton.vue";
import { computed } from "@vue/runtime-core";

// Defining props & emits
const props = defineProps(["activeNavigation", "activeSearch"]);
const emit = defineEmits(["pathUpdated", "update:activeNavigation", "update:appTheme", "update:activeSearch"]);

// Functions
function closeNavigation() {
    emit("update:activeNavigation", false);
}
function resetURLState() {
    window.history.replaceState(null, document.title, "/cheetsheet/");
    closeNavigation();
    emit("pathUpdated");
}
function emitPath() {
    closeNavigation();
    emit("pathUpdated");
}
</script>

<style lang="scss" scoped>
#navigation-drawer {
    width: calc(
        $navigation-drawer-width-inactive - $navigation-drawer-inner-padding * 2 - $navigation-drawer-border-width
    );
    height: 100vh;
    position: fixed;
    z-index: 10;

    background: $navigation-drawer-background-color;
    color: $white;
    .content-wrapper {
        width: $navigation-drawer-inner-width-inactive;
        padding: $navigation-drawer-inner-padding;
        border-right: $navigation-drawer-border-width solid $primary-color-darker;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        justify-content: space-around;

        background-color: $navigation-drawer-inner-background-color;

        transition: all 0.3s ease-in-out;

        p.inactive-msg {
            text-transform: uppercase;
            font-weight: 1000;
            letter-spacing: 4px;
            word-spacing: 6px;
            font-size: 2rem;
            transform-origin: center;
            transform: rotate(-90deg);
            min-width: max-content;
            margin: auto 0;
            background: linear-gradient(
                to right,
                #{$secondary-color-lighter}be 0%,
                $secondary-color-lighter 5%,
                #{$secondary-color-lighter}be 15%
            );
            background-position: 0;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 4s infinite linear;
            animation-fill-mode: forwards;
        }

        @keyframes shine {
            0% {
                background-position: 0;
            }
            100% {
                background-position: 100vh;
            }
        }
    }

    // Active Navigation
    &.active {
        width: 100vw;
        .content-wrapper {
            width: 256px;
            justify-content: start;
            flex-direction: column;

            .inner-wrapper {
                height: 100%;
                .nav-title {
                    margin: 0 0 1rem 0;
                    font-size: 2rem;
                    text-align: center;
                    white-space: nowrap;
                }
                .legals {
                    margin: auto;
                }
            }

            .theme-switch-btn {
                margin: 0 0 0.5rem 0;
            }
        }
    }
}
</style>
