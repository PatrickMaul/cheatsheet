<template lang="pug">
#search-modal.flex(v-if="props.active", @click.self="closeSearch")
    .card.flex.column
        .card-header
            button.close-btn.pointer(@click="closeSearch")
                span.material-symbols-outlined close
            h1.card-title Search through cheat sheet
            input.searchbar(v-model="data.searchValue", type="text", name="search", placeholder="Type to search...", @input="search")
        
        .card-body.flex-filler
            p.hint(v-if="data.searchResult?.length === 0 && data.searchValue?.length >= 3") Nothing Found
            p.hint(v-if="data.searchResult?.length === 0 && data.recentSearch") Recent search
            ul(v-if="props.searchResult || data.recentSearch")
                search-result-item(v-if="data.searchResult?.length >=1", v-for="result in data.searchResult", :result="result", @update-path="setPathInURL($event)")
                li.recent-search-result.pointer(v-else, v-for="result in data.recentSearch", @click="useRecent(result)") {{result}}
        
        .card-footer
            .fuse-banner.flex
                a.help-link(href="https://fusejs.io/examples.html#extended-search", target="__blank")
                    span.material-symbols-outlined help
                .flex-filler
                span Made with #[a(href="https://fusejs.io/") Fuse.js]

</template>

<script setup>
import { onMounted, onUpdated, reactive, watch } from "vue";
import indexedDocs from "@/assets/json/indexed_docs_directory.json";
import Fuse from "fuse.js";

import searchResultItem from "./searchResultItem.vue";

const props = defineProps(["active"]);
const emit = defineEmits(["update:active", "pathUpdated", "closeNavigation"]);
const data = reactive({
    searchValue: null,
    searchValueList: null,
    recentSearch: null,
    searchResult: [],
});
const minSearchLength = 3;
const maxRecentSearchValues = 5;

function search() {
    let searchValue = data.searchValue;

    if (searchValue?.length < minSearchLength) {
        data.searchResult = [];
        return;
    }

    let fuzzySearchValue = searchValue;
    if (searchValue.match(/^\\/)) fuzzySearchValue = `="${searchValue.substring(1)}"`;

    const options = {
        includeScore: true,
        includeMatches: true,
        shouldSort: true,
        minMatchCharLength: minSearchLength,
        threshold: 0.8,
        useExtendedSearch: true,
        keys: ["title", "description", "keywords"],
    };

    var highlighter = function (resultItem) {
        resultItem.item.highlighted = {};
        resultItem.matches.forEach((matchItem) => {
            if (matchItem.key != "keywords") {
                var matchValue = resultItem.item[matchItem.key];
                var result = [];
                var matches = [].concat(matchItem.indices);
                var pair = matches.shift();

                for (var i = 0; i < matchValue.length; i++) {
                    var char = matchValue.charAt(i);
                    if (pair && i == pair[0]) {
                        result.push('<span class="fuzzy-highlight">');
                    }
                    result.push(char);
                    if (pair && i == pair[1]) {
                        result.push("</span>");
                        pair = matches.shift();
                    }
                }
                resultItem.item.highlighted[matchItem.key] = result.join("");
            } else {
                matchValue = resultItem.item[matchItem.key]; // Array
                result = [];

                matchValue.forEach((value) => {
                    if (value != matchItem.value) {
                        result.push(value);
                        return;
                    }

                    var matches = [].concat(matchItem.indices);
                    var pair = matches.shift();
                    let keyword = "";
                    for (i = 0; i < value.length; i++) {
                        char = value.charAt(i);
                        if (pair && i == pair[0]) {
                            keyword = '<span class="fuzzy-highlight">';
                        }
                        keyword += char;
                        if (pair && i == pair[1]) {
                            keyword += "</span>";
                            pair = matches.shift();
                        }
                    }
                    result.push(keyword);
                });
                resultItem.item.highlighted.keywords = result;
            }
        });
        return resultItem;
    };

    const fuse = new Fuse(data.searchValueList, options);
    let result = fuse.search(fuzzySearchValue);

    result = result.map((resultItem) => highlighter(resultItem)).map((el) => el.item);
    data.searchResult = result;
}

function useRecent(recent) {
    data.searchValue = recent;
    search(recent);
}

function setPathInURL(path) {
    window.history.replaceState(null, document.title, `?path=${path}`);
    emit("pathUpdated");
    closeSearch();
    emit("closeNavigation");
}

function closeSearch() {
    if (data.searchValue?.length >= minSearchLength) {
        let recentSearch = loadRecentSearch();

        if (!recentSearch) {
            recentSearch = [];
            recentSearch.push(data.searchValue);
        } else {
            if (!recentSearch.includes(data.searchValue)) {
                if (recentSearch.length === maxRecentSearchValues) {
                    recentSearch.pop();
                }
                recentSearch.unshift(data.searchValue);
            }
        }
        localStorage.setItem("recentSearch", JSON.stringify(recentSearch));
    }
    data.searchValue = null;
    data.searchResult = [];
    emit("update:active", false);
}

onUpdated(() => {
    if (props && props.active) {
        const searchbar = document.querySelector("#search-modal .card .searchbar");
        searchbar.focus();
    }
});

function loadRecentSearch() {
    return JSON.parse(localStorage.getItem("recentSearch"));
}
watch(props, (props) => {
    if (props.active) {
        const loadedRecentSearch = loadRecentSearch();
        if (data.recentSearch != loadedRecentSearch) data.recentSearch = loadedRecentSearch;
        else if (!loadedRecentSearch) data.recentSearch = [];
    }
});

onMounted(() => {
    data.searchValueList = indexedDocs.map((section) => section.links).flat(1);
});
</script>

<style lang="scss" scoped>
#search-modal {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    width: 100vw;
    height: 100vh;
    background-color: $cs-nd-overlay-background; // dark semi-transparent
    color: $cs-black;

    .card {
        margin: auto;
        padding: $cs-padding;
        background-color: #ffffff;
        width: 600px;
        height: 600px;
        border-radius: 10px;
        box-shadow: 2px 2px 15px #ffffff80; // TODO: make it prettier
        .card-header {
            position: relative;
            padding: 0 0 $cs-padding 0;
            .close-btn {
                position: absolute;
                top: 0;
                right: 0;
                width: 30px;
                height: 30px;
                padding: 0;
                background-color: transparent;
                border: none;
                span.material-symbols-outlined {
                    font-size: 30px;
                }
            }
            .card-title {
                text-align: center;
                margin: 0 0 18px 0;
            }
            .searchbar {
                width: 100%;
                font-size: 18px;
                padding: $cs-padding;

                &:focus {
                    outline-color: $cs-primary-color-lighter;
                }
            }
        }
        .card-body {
            height: 433px;
            overflow-y: auto;
            border-top: 1px solid $cs-primary-color;
            padding: $cs-padding 0 0 0;

            ul {
                padding: 0;
                margin: 0;
                list-style-type: none;

                .recent-search-result {
                    border: 2px solid $cs-primary-color;
                    border-radius: 3px;
                    padding: $cs-padding;
                    margin: 0 0 $cs-padding 0;
                }
            }
        }
        .card-footer {
            border-top: 1px solid $cs-primary-color;
            .fuse-banner {
                height: 48px;
                align-items: center;
                justify-content: center;
                background-color: #ffffff;
                .help-link {
                    height: 24px;
                }
            }
        }
    }
}
</style>
