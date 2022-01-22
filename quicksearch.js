browser.omnibox.setDefaultSuggestion({
    description: "Navigate faster with !f"
});

var __placeholder__ = "$TERM$";
var __default_resolvers = {
    "cr": "https://crates.io/crates/$TERM$",
    "rs": "https://docs.rs/$TERM$/latest",
    "go": "https://pkg.go.dev/search?q=$TERM$"
    "yt": "https://www.youtube.com/results?search_query=$TERM$"
};

var resolvers = __default_resolvers;

var loadResolvers = function() {
    browser.storage.local.get("resolvers").then((v) => {
        if (v.hasOwnProperty("resolvers")) {
            resolvers = v.resolvers;
            return;
        }

        // If the resolvers are empty, store the default values.
        browser.storage.local.set({"resolvers": __default_resolvers});
    });
};

// Initialize the resolvers
loadResolvers();

browser.storage.onChanged.addListener((changes, areaName) => {
    console.log("Data loaded", changes);
    loadResolvers();
});

browser.omnibox.onInputEntered.addListener((text, _disposition) => {
    var resolvedValue = resolveUrl(text);
    if (resolvedValue) {
        browser.tabs.update({
            url: resolveUrl(text)
        });
    }
});

function resolveUrl(text) {
    delimPos = text.indexOf(" ");
    if (delimPos == -1) {
        // return undefined as we don't have anything to do.
        return;
    }

    // eg: "rs foo" => key = rs, value = foo
    var key = text.substr(0, delimPos);

    urlTemplate = resolvers[key];
    if (urlTemplate !== undefined) {
        var value = text.substr(delimPos + 1);
        return urlTemplate.replace(__placeholder__, value);
    }
}
