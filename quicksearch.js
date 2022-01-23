browser.omnibox.setDefaultSuggestion({
    description: "Find what you need faster with !f"
});

const __placeholder__ = "$TERM$";
const __default_resolvers = {
    "cr": "https://crates.io/crates/$TERM$",
    "rs": "https://docs.rs/$TERM$/latest",
    "go": "https://pkg.go.dev/search?q=$TERM$",
    "yt": "https://www.youtube.com/results?search_query=$TERM$"
};

let resolvers = __default_resolvers;

const loadResolvers = function() {
    browser.storage.local.get("resolvers").then((v) => {
        // The storage will return the output as { "resolvers": Object } as
        // it supports accepting an array of keys.
        if (Object.hasOwn(v, "resolvers")) {
            resolvers = v.resolvers;
            return;
        }

        // If the resolvers are empty, store the default values.
        browser.storage.local.set({"resolvers": __default_resolvers});
    }, (e) => {
        // Log the error for diagnosis
        console.error(`Failed to get the resolvers ${e}`);
    });
};

// Initialize the resolvers
loadResolvers();

// In the event of modifications to the list of resovlers from the settings,
// they are loaded and cached in the plugin.
browser.storage.onChanged.addListener(() => {
    loadResolvers();
});

// This function will be triggered only when the omnibox contains text which has
// the trigger phrase as the prefix and return has been pressed. It will try to
// look for the resolver, if found, it will load the new URL in the omnibox and
// trigger the tab to open that. If a resolver is not found, it's going to clear
// the text from the omnibox.
browser.omnibox.onInputEntered.addListener((text) => {
    const resolvedValue = resolveUrl(text);
    if (resolvedValue) {
        browser.tabs.update({
            url: resolveUrl(text)
        });
    }
});

// A simple replacer which will replace the placeholder from the phrase. This
// function will not take care of encoding the input as that's delegated to the
// browser.
function resolveUrl(text) {
    text = text.trim();
    const delimPos = text.indexOf(" ");
    if (delimPos == -1) {
        // return undefined as we don't have anything to do.
        return;
    }

    // eg: "rs foo" => key = rs, value = foo
    const key = text.substr(0, delimPos);

    const urlTemplate = resolvers[key];
    if (urlTemplate !== undefined) {
        const value = text.substr(delimPos + 1);
        return urlTemplate.replace(__placeholder__, value);
    }
}
