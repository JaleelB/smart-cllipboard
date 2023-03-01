//listener to detect when the user copies content to the clipboard.
// IT categorize the copied data into text, images, links, or files based on its type.
//Then, storesthe data into the appropriate storage area (text, images, links, or files) using Chrome's storage API.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    
    if (message.action == "copy") {
        chrome.storage.local.get("clipboard", function(result) {
            console.log(result)
            let clipboard = result.clipboard || {
                text: [],
                images: [],
                links: [],
                files: []
            };

            if (message.data.type == "string" && clipboard.text.indexOf(message.data.src) == -1) {
                clipboard.text.unshift(message.data.src);
            } else if (message.data.type == "image" && clipboard.images.indexOf(message.data.src) == -1) {
                clipboard.images.unshift(message.data.src);
            } else if (message.data.type == "link" && clipboard.links.indexOf(message.data.href) == -1) {
                clipboard.links.unshift(message.data.href);
            } else if (message.data.type == "file" && clipboard.files.indexOf(message.data.src) == -1) {
                clipboard.files.unshift(message.data.src);
            }

            chrome.storage.local.set({clipboard: clipboard}, function() {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    sendResponse({success: false});
                } else if (sendResponse) {
                    sendResponse({success: true});
                }
            });
            
        });

        return true;
    }
});
