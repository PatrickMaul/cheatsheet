<template lang="pug">
#navigation-drawer(:class="{'active':props.activeNavigation}")
    .top-bar.flex
        circleIconButton.burger-menu(:icon="'menu'", :tooltip="'Open menu'", icon-size-class="large", @click="emit('update:activeNavigation', !props.activeNavigation);")
        h2.nav-title.pointer.text-ellipsis(@click="resetURLState") Cheat sheet
        .flex-filler
        circleIconButton.theme-switch(:icon="'brightness_4'", :tooltip="'Switch theme'", icon-size-class="large",  @click="toggleTheme")
        circleIconButton.search-button(:icon="'search'", :tooltip="'Open Search'", icon-size-class="large", @click="emit('update:activeSearch', true)")
    
    .expansion-bar
        //- For toolbox uncomment following lines
        //- these file [15f.] $ [74ff.]
        //- _variable.scss [19] & [22]

        //- .tools.flex
        //-     .flex-filler
        
        navigation-list(@path-updated="emitPath")
        .legals.flex
            a.text-ellipsis(href="?path=src/docs/imprint.md") Imprint
</template>

<script setup>
// Components
import navigationList from "./navigationList.vue";
import circleIconButton from "./core/buttons/circleIconButton.vue";

// Defining props & emits
const props = defineProps(["activeNavigation", "activeSearch"]);
const emit = defineEmits(["pathUpdated", "update:activeNavigation", "update:appTheme", "update:activeSearch"]);

// Functions
function closeNavigation() {
    emit("update:activeNavigation", false);
}
function resetURLState() {
    window.history.replaceState(null, document.title, "/cheetsheet/");
    emitPath();
}
function emitPath() {
    closeNavigation();
    emit("pathUpdated");
}
function toggleTheme() {
    closeNavigation();
    emit("update:appTheme");
}
</script>

<style lang="scss" scoped>
#navigation-drawer {
    width: 100%;
    max-width: 100vw;

    background: $cs-nd-inner-background-color;
    color: $cs-white;

    .top-bar {
        height: $cs-nd-height;
        padding: $cs-padding;

        align-items: center;

        .nav-title {
            margin: 0 0 0 1rem;
        }
    }

    .expansion-bar {
        height: 0;
        padding: $cs-padding;
        display: none;

        // .tools {
        //     height: $cs-nd-tools-height;
        // }

        .legals {
            box-sizing: content-box;
            height: $cs-nd-legals-height;
            padding-top: $cs-nd-legals-padding-top;

            border-top: $cs-border-width solid $cs-white;
            align-content: center;
            a {
                margin: auto 0;
                width: 100%;
                height: max-content;
                text-align: center;
                color: inherit;
                text-decoration: none;
            }
        }
    }

    // Active Navigation
    &.active {
        .expansion-bar {
            height: calc(100vh - $cs-nd-height);
            display: block;
        }
    }
}
</style>
