//callback function will be called when the response is sent back from the background script.
chrome.runtime.sendMessage({action: "copy"}, function(response) {
    if (response.success) {
      console.log("Copy successful!");
    } else {
      console.log("Copy failed.");
    }
});

function copyHandler(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    let clipboardItem = {};

    if (clipboardData && clipboardData.items) {
        for (var i = 0; i < clipboardData.items.length; i++) {
            var item = clipboardData.items[i];

            if (item.type.indexOf("text") !== -1) {
                item.getAsString(function(text) {
                    clipboardItem = { type: "string", src: text };
                    chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                });
            } else if (item.type.indexOf("image") !== -1) {
                var blob = item.getAsFile();
                var reader = new FileReader();

                reader.onloadend = function() {
                    clipboardItem = { type: "image", src: reader.result };
                    chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                };

                reader.readAsDataURL(blob);
            } else if (item.type.indexOf("url") !== -1) {
                clipboardItem = { type: "link", href: item.getData("text/plain") };
                chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
            } else if (item.kind === "file") {
                var blob = item.getAsFile();
                var reader = new FileReader();

                reader.onloadend = function() {
                    clipboardItem = { type: "file", src: reader.result };
                    chrome.runtime.sendMessage({ action: "copy", data: clipboardItem });
                };

                reader.readAsDataURL(blob);
            }
        }
    }
}

document.addEventListener("copy", copyHandler);
