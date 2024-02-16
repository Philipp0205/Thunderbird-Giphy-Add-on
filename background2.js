browser.runtime.onMessage.addListener((message) => {
    if (message.action === "insertImage") {
        insertImageIntoEmail(message.url);
    }
});

function insertImageIntoEmail(url) {
    // Access the active compose window
    browser.compose.getComposeDetails(tab.id).then((details) => {
        const imgTag = `<img moz-do-not-send="true" src="${url}" alt="">`;
        const newBody = details.body + imgTag; // You might need to insert it at a specific location

        browser.compose.setComposeDetails(tab.id, {
            body: newBody
        });
    });
}
