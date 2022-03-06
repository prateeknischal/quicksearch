let runtime = browser.runtime;

browser.omnibox.setDefaultSuggestion({
    description: "Find what you need faster with !f"
});

const __placeholder = "$TERM$";
const __key_reserve_prefix = '@';

const __default_resolvers = {
    "cr": "https://crates.io/crates/$TERM$",
    "rs": "https://docs.rs/$TERM$/latest",
    "go": "https://pkg.go.dev/search?q=$TERM$",
    "yt": "https://www.youtube.com/results?search_query=$TERM$",
    "kc": "https://c.xkcd.com/random/comic/"
};

// The reserved keys dictionary contains the functions to be executed against
// the keywords. At this time, they are not accepting any args which can be
// extended in the future where if the key is a reserved key, then all tokens
// after that will be sent in as the argument. for example,
//
// !f @config foo bar baz
// __reserved_keys['config']('foo bar baz')
//
// It will be upto the function to decide what to do with the unparsed input.
const __reserved_keys = {
    "settings": runtime.openOptionsPage,
    "setting": runtime.openOptionsPage,
    "config": runtime.openOptionsPage
}

let resolvers = __default_resolvers;

const loadResolvers = function() {
    browser.storage.local.get("resolvers").then((v) => {
        // The storage will return the output as { "resolvers": Object } as
        // it supports accepting an array of keys.
        if (Object.hasOwnProperty.call(v, "resolvers")) {
            resolvers = v.resolvers;
            return;
        }

        // If the resolvers are empty, store the default values
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

    // Define the key as the first token in irrespective of if there is a
    // replacing value. If the value is empty, the token would represent a
    // bookmark.
    let key = text;
    if (delimPos != -1) {
        // eg: "rs foo" => key = rs, value = foo
        key = text.substr(0, delimPos);
    }

    // Check if the key is reserved
    if (isReservedKey(key)) {
        const op = __reserved_keys[key.replace(__key_reserve_prefix, '')];
        if (op !== undefined && typeof(op) === 'function') {
            // Call the function against the reserved keyword
            op();
        }
        return;
    }

    const urlTemplate = resolvers[key];
    if (urlTemplate !== undefined) {
        const value = delimPos == -1 ? '' : text.substr(delimPos + 1);
        return urlTemplate.replace(__placeholder, value);
    }
}

function isReservedKey(key) {
    if (key.length == 0) {
        return false;
    }

    if (!key.startsWith(__key_reserve_prefix)) {
        return false;
    }

    return true;
}
