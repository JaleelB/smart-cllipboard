console.log("Background script running")
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'clipboard-data') {
        
        const { items } = request.data;

        console.log("items: ", items)

        const categories = {
            text: [],
            link: [],
            image: [],
            file: [],
        };

        // Categorize the copied items
        items.forEach((item) => {
        if (item.type === 'text') {
            categories.text.push(item);
        } else if (item.type === 'html') {
            if (typeof DOMParser !== 'undefined') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.data, 'text/html');
                const links = doc.querySelectorAll('a');
                const images = doc.querySelectorAll('img');
                const files = doc.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".ppt"], a[href$=".pptx"]');
    
                if (links.length > 0) {
                categories.link.push(...links);
                }
    
                if (images.length > 0) {
                categories.image.push(...images);
                }
    
                if (files.length > 0) {
                categories.file.push(...files);
                }
            }
        } else if (item.type === 'image') {
            categories.image.push(item);
        } else if (item.type === 'file') {
            categories.file.push(item);
        }
        });

        // Save the categorized items to storage
        chrome.storage.local.get(['text', 'link', 'image', 'file'], (result) => {
            // const { text: storedText, link: storedLink, image: storedImage, file: storedFile } = result;

            const storedText = result.text ?? [];
            const storedLink = result.link ?? [];
            const storedImage = result.image ?? [];
            const storedFile = result.file ?? [];

            console.log(storedText, storedLink, storedImage, storedFile)

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
});
