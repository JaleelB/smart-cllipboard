console.log("Background script running")

chrome.runtime.onInstalled.addListener(function() {
    //sets initial copied clipboard storage state
    chrome.storage.local.set({
        text: [],
        link: [],
        image: [],
        file: [],
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.type === 'clipboard-data') {
        
        const { items } = request.data;

        const categories = {
            text: [],
            link: [],
            image: [],
            file: [],
        };
                
        // Categorize the copied items
        items.forEach((item) => {
            console.log(item)
            if (item.type === 'html') {
                try {
                    // console.log("html", item.data)

                    const { text, links, images, files } = item.data;
                    // console.log("images: ", images);
                    
                    if (text.length > 0) categories.text.push(...text);
                    if (links.length > 0) categories.link.push(...links);
                    if (images.length > 0) categories.image.push(...images);
                    if (files.length > 0) categories.file.push(...files);

                } catch (err) {
                    console.error(err);
                }
            }else{
                categories[item.type].push(item);
            }
        });

        // Save the categorized items to storage
        chrome.storage.local.get(['text', 'link', 'image', 'file'], (result) => {

            const storedText = result.text ?? [];
            const storedLink = result.link ?? [];
            const storedImage = result.image ?? [];
            const storedFile = result.file ?? [];

            chrome.storage.local.set({
                text: [...storedText, ...categories.text],
                link: [...storedLink, ...categories.link],
                image: [...storedImage, ...categories.image],
                file: [...storedFile, ...categories.file],
            }, () => {
                sendResponse({ success: true });
            });
        });

        return true; // required to keep the message channel open until async task completes
    }
    else if (request.type === 'get-clipboard-data') {
        chrome.storage.local.get(['text', 'link', 'image', 'file'], (data) => {
            
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ success: false, message: 'Could not retrieve clipboard data.' });
            } else {
                sendResponse({ success: true, data });
            }

        });
        return true;
    }
    else if (request.type === 'remove-clipboard-item') {

        const { category, index } = request.data;

        // chrome.storage.local.get([category], (result) => {
        //     const storedItems = result[category] ?? [];
        //     storedItems.splice(index, 1);
        //     chrome.storage.local.set({ [category]: storedItems }, () => {
        //         sendResponse({ success: true });
        //     });
        // });

        switch (category) {
            case 'text':
            case 'link':
            case 'image':
            case 'file':
                chrome.storage.local.get([category], (result) => {
                    const storedItems = result[category] ?? [];
                    storedItems.splice(index, 1);
                    chrome.storage.local.set({ [category]: storedItems }, () => {
                        sendResponse({ success: true });
                    });
                });
                break;
            default:
                console.error('Invalid category:', category);
                sendResponse({ success: false });
                break;
        }
        
        return true;
    }
});
