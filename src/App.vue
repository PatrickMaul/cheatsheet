<template lang="pug">
navigation-drawer(v-model:activeSearch="states.activeSearch", v-model:activeNavigation="states.activeNavigation", @path-updated="renderMarkdownFile()", @update:appTheme="toggleTheme()")
search-modal(v-model:active="states.activeSearch", @close-navigation="closeNavigationAndResetSearchValue" @path-updated="renderMarkdownFile()")
main#content(:class="{'no-scroll':states.activeNavigation}")
</template>

<script setup>
import { markdown } from "./markdownit";
import { onMounted, inject, reactive } from "vue";
import { http } from "./axios.js";
import ClipboardJs from "clipboard";

// Components
import navigationDrawer from "./components/navigationDrawer.vue";
import searchModal from "./components/searchModal.vue";
import { trigger } from "@vue/reactivity";

// Defining config & states
const config = inject("config");
const states = reactive({
    activeNavigation: false,
    activeSearch: false,
    lightMode: true,
});

function addFragments(preRenderedMarkdownFile) {
    const headlineLists = [
        preRenderedMarkdownFile.querySelectorAll("h2"),
        preRenderedMarkdownFile.querySelectorAll("h3"),
    ];

    headlineLists.forEach((headlineList) => {
        headlineList.forEach((element) => {
            element.id = element.innerText.toLowerCase().replaceAll(" ", "-");

            let copiedElement = element.cloneNode(true);

            const link = document.createElement("a");
            link.href = `#${element.id}`;
            link.classList.add("fragment-link");
            link.append(copiedElement);

            const fragment = document.createElement("span");
            fragment.classList.add("material-symbols-outlined");
            fragment.innerText = "link";
            link.appendChild(fragment);

            preRenderedMarkdownFile.body.replaceChild(link, element);
        });
    });

    return preRenderedMarkdownFile;
}

function addAttributes(preRenderedMarkdownFile) {
    const elementListConfigs = [
        {
            elementTag: "h1",
            class: "site-title",
        },
        {
            elementTag: "h2",
            class: "headline",
        },
        {
            elementTag: "h3",
            class: "sub-headline",
        },
        {
            elementTag: "p",
            class: "paragraph",
            children: [
                {
                    elementTag: "code",
                    class: "inline-code",
                },
            ],
        },
        {
            elementTag: "ul",
            class: "list",
            children: [
                {
                    elementTag: "li",
                    class: "list-item",
                },
            ],
        },
        {
            elementTag: "pre",
            class: "code-block",
        },
        {
            elementTag: "a",
            class: "link",
        },
    ];

    elementListConfigs.forEach((config) => {
        const elements = preRenderedMarkdownFile.querySelectorAll(config.elementTag);
        if (config.elementTag === "h1" && elements.length === 1) {
            elements[0].id = "site-title";
            const siteTitle = elements[0].innerText;
            document.title = siteTitle === "Cheat sheet" ? `${siteTitle} | Home` : `Cheat sheet | ${siteTitle}`;
        } else if (config.elementTag === "h1" && elements.length === 0) {
            document.title = "Cheat sheet | Doc";
        } else {
            elements.forEach((element) => {
                element.classList.add(config.class);

                if (config.children) {
                    config.children.forEach((child) => {
                        const childElements = preRenderedMarkdownFile.querySelectorAll(child.elementTag);
                        childElements.forEach((childElement) => {
                            childElement.classList.add(child.class);
                        });
                    });
                }
            });
        }
    });
    return preRenderedMarkdownFile;
}

// Render function
async function renderMarkdownFile() {
    const md = markdown;
    const urlQuery = window.location.search.replace("?path=", "");

    const path = urlQuery ? "/" + urlQuery : "/src/docs/index.md";
    const rawMarkdownFile = (await http.get(path)).data;
    let preRenderedMarkdownFile = new DOMParser().parseFromString(
        addCopyElementToPreElements(md.render(rawMarkdownFile)),
        "text/html"
    );
    preRenderedMarkdownFile = addAttributes(preRenderedMarkdownFile);
    preRenderedMarkdownFile = addFragments(preRenderedMarkdownFile);

    document.querySelector("main#content").innerHTML = preRenderedMarkdownFile.querySelector("body").innerHTML;

    const clipboard = new ClipboardJs(".clipboard", {
        text: (preIconElement) => {
            return preIconElement.nextElementSibling.innerText;
        },
    });
    clipboard.on("success", (e) => {
        console.log("copy success", e);
        e.trigger.innerText = "check";
        setTimeout(() => {
            e.trigger.innerText = "content_copy";
        }, 1000);
    });
    clipboard.on("error", (e) => {
        console.log("copy error", e);
    });
}

function addCopyElementToPreElements(content) {
    return content.replaceAll(/\<pre\>/g, (value) => {
        return `${value}<span class="clipboard  material-symbols-outlined">content_copy</span>`;
    });
}

function closeNavigationAndResetSearchValue() {
    states.activeNavigation = !states.activeNavigation;
    states.searchValue = null;
}

function toggleTheme(init = false) {
    if (!init) {
        states.lightMode = !states.lightMode;
    }
    if (states.lightMode) {
        document.getElementById("app").classList.remove("dark");
        document.getElementById("app").classList.add("light");
    } else {
        document.getElementById("app").classList.add("dark");
        document.getElementById("app").classList.remove("light");
    }
}

onMounted(() => {
    document.addEventListener("DOMContentLoaded", () => {
        renderMarkdownFile();
        toggleTheme(true);
    });
});
</script>

<style lang="scss" scoped>
#content {
    max-width: 900px;
    min-height: 100vh;
    margin: 0 auto;
    padding: $app-padding;
    padding-left: $navigation-drawer-width-inactive + $app-padding;

    &.no-scroll {
        height: calc(100vh - $app-padding * 2);
        overflow: hidden;
    }
}
</style>
