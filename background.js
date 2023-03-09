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

        //provide a fallback implementation if the DOMParser class is not defined.
        const parseHtml = (htmlString) => {
            const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : {
              parseFromString: (str, contentType) => {
                const doc = document.implementation.createHTMLDocument('');
                doc.documentElement.innerHTML = str;
                return doc;
              }
            };
            return parser.parseFromString(htmlString, 'text/html');
        }

        // Categorize the copied items
        items.forEach((item) => {
        if (item.type === 'text') {
            categories.text.push(item);
        } else if (item.type === 'html') {
            try {
                const doc = parseHtml(item.data);
                const links = doc.querySelectorAll('a');
                const images = doc.querySelectorAll('img');
                const files = doc.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".ppt"], a[href$=".pptx"]');
                console.log("images: ", images);
    
                if (links.length > 0) {
                    categories.link.push(...links);
                }
    
                if (images.length > 0) {
                    categories.image.push(...images);
                }
    
                if (files.length > 0) {
                    categories.file.push(...files);
                }
            } catch (err) {
                console.error(err);
            }
            
            // }
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
            console.log(data)
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
