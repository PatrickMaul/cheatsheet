// Import all needed stuff
const fs = require("fs");
const path = require("path");
const lemmatizer = require("node-lemmatizer");
const natural = require("natural");

// Initialize needed variables / constance's
const indexedDocs = [];

// Read base directory
const docsBasePath = "./src/docs";
let docsDirectoryContent = fs.readdirSync(docsBasePath);
console.log(`Has read '${docsBasePath}'`);

// Remove files
docsDirectoryContent = removeFilesFromDocsDir(docsDirectoryContent);
console.log(`Found subdirectories in '${docsBasePath}': ${docsDirectoryContent}`);

docsDirectoryContent = docsDirectoryContent.map((subDirectory) => {
    if (fs.lstatSync(`${docsBasePath}/${subDirectory}`).isDirectory()) return `${docsBasePath}/${subDirectory}`;
});

// Read subdirectories
docsDirectoryContent.forEach((subDirectory) => {
    const subDirectoryDocuments = fs.readdirSync(subDirectory);
    console.log(`Found documents in '${subDirectory}': ${subDirectoryDocuments}`);

    let indexedSubDirectoryDocuments = [];

    // Read all documents in subdirectory
    for (const document of subDirectoryDocuments) {
        // Only markdown files
        if (fs.lstatSync(`${subDirectory}/${document}`).isFile() && path.extname(document) === ".md") {
            const indexedFile = indexingDocument(`${subDirectory}/${document}`);
            indexedSubDirectoryDocuments.push(indexedFile);
            console.log(`Document '${document}' in '${subDirectory}' indexed.`);
        }
    }
    indexedDocs.push({
        title: formatTitle(subDirectory.replace("./src/docs/", "")),
        links: indexedSubDirectoryDocuments,
    });
});

// Write into file
fs.writeFileSync("./src/assets/json/indexed_docs_directory.json", JSON.stringify(indexedDocs));

function removeFilesFromDocsDir(docsDir) {
    const result = [];
    docsDir.forEach((x) => {
        if (fs.lstatSync(`${docsBasePath}/${x}`).isDirectory()) result.push(x);
        else console.log(`Removed: ${x}`);
    });
    return result;
}

function formatTitle(title) {
    title = title[0].toUpperCase() + title.substring(1);
    title = title.replace("_", " ");

    return title;
}

function indexingDocument(documentPath) {
    // Indexing document (Load title, description and keywords)
    const documentContent = fs.readFileSync(documentPath).toString();
    const [title, description, keywords] = getDocumentSpecs(documentContent);
    // Generate more keywords from document content
    const generatedKeywords = generateKeywordsFromDocument(documentContent, 6);
    let mergedKeywords = new Set([...keywords, ...generatedKeywords]);

    return { title, description, keywords: [...mergedKeywords], path: documentPath.replace("./", "") };
}

function getDocumentSpecs(documentContent) {
    // Load document specs from document itself, like title, description and the preserved keywords.
    const documentLines = documentContent.split(/r?\n/);
    const title = loadDocumentTitle(documentLines);
    const description = loadDocumentDescription(documentLines);
    const keywords = loadDocumentPreservedKeywords(documentLines);

    return [title, description, keywords];
}

function loadDocumentTitle(documentLines) {
    // Load just the title from a document. Title is first found line with '# '
    for (let i = 0; i < documentLines.length; i++) {
        const line = documentLines[i];
        const lineIsTitle = !!line.match(/^# {1}/);

        if (lineIsTitle) {
            return line.replace(/^# {1}/, "");
        }
    }
}

function loadDocumentDescription(documentLines) {
    // Load just the description from a document. Description is line with '[description]: <> '
    for (let i = 0; i < documentLines.length; i++) {
        const line = documentLines[i];
        const lineIsDescription = line.includes("[description]: <> ");

        if (lineIsDescription) {
            const extractedDescription = line.match(/(?<=\().+(?=\))/);
            return extractedDescription ? extractedDescription[0] : null;
        }
    }
}

function loadDocumentPreservedKeywords(documentLines) {
    // Load just the preservedKeywords from a document. PreservedKeywords is line with '[preservedKeywords]: <> '
    for (let i = 0; i < documentLines.length; i++) {
        const line = documentLines[i];
        const lineIsPreservedKeywords = line.includes("[preservedKeywords]: <> ");

        if (lineIsPreservedKeywords) {
            const extractedPreservedKeywords = line.match(/(?<=\().+(?=\))/);
            return extractedPreservedKeywords ? extractedPreservedKeywords[0].split(", ") : null;
        }
    }
}

///////////////////////////////////////////
// Generate keywords from Markdown file. //
///////////////////////////////////////////

function generateKeywordsFromDocument(documentContent, maxKeywords = null) {
    // Generate keywords from document content
    // 1. Lowercase the whole document
    documentContent = documentContent.toLowerCase();
    // 2. Tokenize content, remove all non word signs and everything with numbers
    let tokens = tokenizeDocumentContent(documentContent);
    tokens = partOfSpeech(tokens);
    let lemmatizedTokens = lemmatizeTokens(tokens);
    lemmatizedTokens = removeStopWords(lemmatizedTokens);
    let termFrequencyTokens = calculateTermFrequency(lemmatizedTokens);
    termFrequencyTokens = calculateDocumentFrequency(termFrequencyTokens);

    return getBestKeywords(termFrequencyTokens, maxKeywords);
}

function tokenizeDocumentContent(document) {
    // Simply split the text, and isolates each word. Removes and digit
    let tokenizedDocument = document.split(/[ ,\\[\]:().#?*+`\\/{}";\n<>=!]/g);

    let result = [];
    // Remove numbers and everything starts, ends or is a numbers.
    tokenizedDocument.map((token) => {
        token = token.replace(/^[']/, "").replace(/[']$/, "");

        const startsWithNumber = token.match(/^[0-9].*/);
        const endsWithNumber = token.match(/.*[0-9]$/);
        if (startsWithNumber || endsWithNumber) {
            return;
        }
        result.push(token);
    });

    return result;
}

function partOfSpeech(tokens) {
    // Defining the part of speech for each word.
    const language = "EN";
    const defaultCategory = "N"; // N => noun

    var lexicon = new natural.Lexicon(language, defaultCategory);
    var ruleSet = new natural.RuleSet("EN");
    var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

    return tagger.tag(tokens);
}

function lemmatizeTokens(content) {
    // Lemmatize tokens. all words will be set to their base => dogs > dog
    let result = [];
    content.taggedWords.forEach((word) => {
        if (["N", "NN", "NNS", "NNP", "NNPS"].includes(word.tag)) {
            // Nouns
            const lem = lemmatizer.lemmas(word.token, "noun");
            if (!lem || lem.length <= 0 || !lem[0][1]) {
                return;
            }
            result.push(lem[0][0]);
        } else if (["JJ", "JJR", "JJS"].includes(word.tag)) {
            // Adjectives
            const lem = lemmatizer.lemmas(word.token, "adj");
            if (!lem || lem.length <= 0 || !lem[0][1]) {
                return;
            }
            result.push(lem[0][0]);
        } else if (["RB", "RBR", "RBS"].includes(word.tag)) {
            // Adverbs
            const lem = lemmatizer.lemmas(word.token, "adv");
            if (!lem || lem.length <= 0 || !lem[0][1]) {
                return;
            }
            result.push(lem[0][0]);
        } else if (["VB", "VBD", "VBG", "VBN", "VBP", "VBZ"].includes(word.tag)) {
            // Verbs
            const lem = lemmatizer.lemmas(word.token, "verb");
            if (!lem || lem.length <= 0 || !lem[0][1]) {
                return;
            }
            result.push(lem[0][0]);
        } else if (["FW"].includes(word.tag)) {
            // Foreign Words
            result.push(word.token);
        } else return;
    });
    return result;
}

function removeStopWords(tokens) {
    // Remove stop words like i, and, an, you etc.
    const loadedStopWordString = fs.readFileSync("./src/assets/json/en_stop_words.json").toString();
    const stopWords = JSON.parse(loadedStopWordString);

    stopWords.forEach((stopWord) => {
        tokens = tokens.filter((x) => x != stopWord);
    });
    return tokens;
}

function calculateTermFrequency(content) {
    let results = [];

    // Count the token inside the document
    content.forEach((token) => {
        const searchForTokenResult = results.filter((x) => x.token === token);
        const searchForTokenResultLength = searchForTokenResult.length;
        const hasToken = searchForTokenResultLength === 1;

        if (hasToken) {
            let tokenObj = searchForTokenResult[0];
            const tokenObjPosition = results.indexOf(tokenObj);
            tokenObj.wordCounter += 1;
            results[tokenObjPosition] = tokenObj;
        } else {
            results.push({ token: token, wordCounter: 1 });
        }
    });

    // Sort by wordCount
    if (results.length >= 2) {
        results = results.sort((a, b) => {
            if (a.wordCounter > b.wordCounter) {
                return -1;
            } else if (a.wordCounter < b.wordCounter) {
                return 1;
            }
            return 0;
        });
    }

    // Set tf and documentCounter
    results.forEach((tfObj) => {
        tfObj.termFrequency = tfObj.wordCounter / content.length;
        tfObj.documentCounter = 0;
    });

    return results;
}

function calculateDocumentFrequency(tokens) {
    // Read subdirectories
    docsDirectoryContent.forEach((subDirectory) => {
        const subDirectoryDocuments = fs.readdirSync(subDirectory);

        // Read all documents in subdirectory
        for (const document of subDirectoryDocuments) {
            // Only markdown files
            if (fs.lstatSync(`${subDirectory}/${document}`).isFile() && path.extname(document) === ".md") {
                const doc = fs.readFileSync(`${subDirectory}/${document}`).toString();
                // Count documents with tokens
                tokens.forEach((tokenObj) => {
                    tokenObj.documentCounter += doc.includes(tokenObj.token) ? 1 : 0;
                });
                // Calculate inverse document frequency (df) and term frequency inverse document frequency (tf-idf)
                tokens.forEach((tokenObj) => {
                    tokenObj.documentCounter = tokenObj.documentCounter || 1;

                    tokenObj.inverseDocumentFrequency = 1 / tokenObj.documentCounter;
                    tokenObj.termFrequencyInverseDocumentFrequency =
                        tokenObj.termFrequency * tokenObj.inverseDocumentFrequency;
                });
            }
        }
    });

    return tokens;
}

function getBestKeywords(tokens, maxKeywords = null) {
    let result = [];
    // Sort by tf-idf
    tokens.sort((a, b) => {
        if (a.termFrequencyInverseDocumentFrequency > b.termFrequencyInverseDocumentFrequency) {
            return -1;
        } else if (a.termFrequencyInverseDocumentFrequency < b.termFrequencyInverseDocumentFrequency) {
            return 1;
        }
        return 0;
    });

    // Either all or set max keywords from document
    if (!maxKeywords) maxKeywords = tokens.length;
    for (let index = 0; index < maxKeywords; index++) {
        const element = tokens[index];
        if (element) result.push(element);
    }

    // Only word from token
    result = result.map((x) => x.token);
    return result;
}
