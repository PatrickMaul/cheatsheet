# Cheat sheet

In this cheat sheet you will find IT topics such as web technologies, code snippets and some basics about Git and Docker and a few hardware-related docs.

It also lists and describes some helpful resources.

Hopefully the articles will be updated regularly. Anyone interested in contributing to this cheat sheet is welcome to do so by cloning or forking the [underlying repository](https://github.com/PatrickMaul/cheatsheet).

Since the cheat sheet was developed for private use only, we apologize for any invalid or outdated information.

## Changelog
Records the history of all changes made to the project.
### 0.3.1 => Currently under development
Will hopefully be deployed on **29th December, 2022**

Upcoming features:
- Fragments beside each `headline` or `sub-headline`
- Fixed navigation drawer animation
### 0.3.0
Added `imprint.md`, depending on these changes the indexing script has changed.

Other changes made:
- Updated `index.md`

Version `0.3.0` was deployed on **27th December, 2022**
### 0.2.1
Styles have been adjusted, but these are still under development. Adjustments have been made to the spacing in the rendered markdown files and to the colors.

Other changes made:
- Update document title when rendering new pages
- Fixed bug (Recent search), if there was no recent search, no search results were displayed

Version `0.2.1` was deployed on **25th December, 2022**
### 0.2.0
Landing page file has been moved and renamed so that the `README.md` serves as developer documentation again. New location is `docs/index.md`, depending on these changes the indexing script has changed.

Added some basic documentation.

Version `0.2.0` was deployed on **21th December, 2022**
### 0.1.6

Code can now be copied directly via a copy button, which appears as soon as a code block is hovered over with the mouse.

Other changes made:
- Improvement of fuzzy search
- Added a footer to the search modals that includes a help link and a link to the [fuse.js website](https://fusejs.io/)
- Minor style adjustments

Version `0.1.6` was deployed on **20th December, 2022**
### 0.1.5 [HOTFIX!]
Sensitive data has been removed from the code.

Other changes made:
- Added fuzzy search using [fuse.js](https://fusejs.io/) => Needs some attention though
- Search results are now highlighted

Version `0.1.5` was deployed on **09th December, 2022**
### 0.1.4
Added build and deployment pipelines. When pushing on the respective branch (`production`), a GitHub action is triggered.

Version `0.1.4` was deployed on **05th December, 2022**
### 0.1.3
All documents within the `doc` folder are automatically keyworded. After the script finishes, `.src/assets/Scripts/indexing_docs_directory.js` may be updated and there will be a new commit on `main`. When pushing on the respective branch (`main`), a GitHub action is triggered.

Other changes made:
- It is no longer possible to scroll the background when the navigation is open
- Git documentation updated
- Search bar is automatically focused when opening search
- Code for buttons has been swapped out
- Last search has been added

Version `0.1.3` was deployed on **02th December, 2022**
### 0.1.2
A search has been added, this can be accessed via the navigation.

Other changes made:
- An animation has been added to the closed navigation
- For better readability, the size of the rendered markdown files has been limited to a maximum of `900px`

Version `0.1.2` was deployed on **29th November, 2022**
### 0.1.1
Added [Git basics](?path=src/docs/version-control/basics.md) and [branching](?path=src/docs/version-control/branching.md) documentation.

Other changes made:
- Skeleton style refactored
- Provided path to markdown file via URL query parameters to allow reloading and sharing
- Code in rendered Markdown files highlighted with [Highlight.js](https://highlightjs.org/)
- Navigation closes as soon as a link is clicked or when you click outside the navigation

Version `0.1.1` was deployed on **28th November, 2022**
### 0.1.0
The first very sketchy version with almost all basic implementations.

Version `0.1.0` was deployed on **27th November, 2022**