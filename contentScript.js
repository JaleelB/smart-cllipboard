function copyHandler(e) {
    console.log(e)
    const clipboardData = e.clipboardData || window.clipboardData;
    let clipboardItem = {};

    if (clipboardData && clipboardData.items) {
        for (const i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            console.log(item)

            if (item.type.indexOf("text") !== -1) {
                item.getAsString(function(text) {
                    clipboardItem = { type: "string", src: text };
                    // chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                });
            } else if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onloadend = function() {
                    clipboardItem = { type: "image", src: reader.result };
                    // chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                };

                reader.readAsDataURL(blob);
            } else if (item.type.indexOf("url") !== -1) {
                clipboardItem = { type: "link", href: item.getData("text/plain") };
                chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
            } else if (item.kind === "file") {
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onloadend = function() {
                    clipboardItem = { type: "file", src: reader.result };
                    // chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                };

                reader.readAsDataURL(blob);
            }
        }

        sendMessageToBackgroundScript({
            action: "copy",
            data: clipboardItem
        });
    }
}

function sendMessageToBackgroundScript(message, callback) {
    chrome.runtime.sendMessage(message, function(response) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        } else if (!response) {
            console.log("Error: no response received from background script.");
        } else if (response.success) {
            console.log("Success: clipboard item copied to background script.");
        } else {
            console.log("Error: clipboard item not copied to background script.");
        }
    });
}

document.addEventListener("copy", copyHandler);
