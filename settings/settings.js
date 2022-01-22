const resovlers = document.querySelector("#resolvers");
const error = document.querySelector("#error");
const msg = document.querySelector("#msg");

function updateUI(restoredSettings) {
    resolvers.value = JSON.stringify(restoredSettings, null, 2);
}

browser.storage.local.get("resolvers").then(updateUI, console.error);

document.querySelector("#submit").addEventListener("click", () => {
    error.style.display="none";
    msg.style.display="none";

    console.log("storing values ", resolvers.value);

    try {
        const v = JSON.parse(resolvers.value);
        browser.storage.local.set(v).then(() => {
            msg.innerHTML = "New Settings persisted";
            msg.style.display="";
            updateUI(v);
        });
    } catch(e) {
        error.innerHTML = "Invalid JSON string";
        error.style.display="";
        console.error(e);
    }
})
