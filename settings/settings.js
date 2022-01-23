// DOM elements on the page to control.
const error = document.querySelector("#error");
const msg = document.querySelector("#msg");

// Update the text box with the currently loaded settings.
function updateUI(settings) {
    const resolvers = document.querySelector("#resolvers");
    resolvers.value = JSON.stringify(settings, null, 2);
}

// Initialize the text area with the current settings.
browser.storage.local.get("resolvers").then((v) => {
    if (Object.hasOwnProperty.call(v, "resolvers")) {
        updateUI(v.resolvers);
    } else {
        updateUI({});
    }
}, console.error);

// Once the settings are submitted, save it!
document.querySelector("#submit").addEventListener("click", () => {
    // TODO (prateeknischal): Fix this, there should be a better way.
    error.style.display="none";
    msg.style.display="none";

    const resolvers = document.querySelector("#resolvers");
    console.log("storing values ", resolvers.value);

    try {
        const v = JSON.parse(resolvers.value);
        browser.storage.local.set({ "resolvers": v }).then(() => {
            msg.innerHTML = "New Settings persisted";
            msg.style.display="";
            updateUI(v);
        }, console.error);
    } catch(e) {
        error.innerHTML = "Invalid JSON string";
        error.style.display="";
        console.error(e);
    }
})

browser.storage.managed.get("version").then((version) => {
    document.querySelector("#version").innerHTML = `v${version}`;
});
