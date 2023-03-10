console.log("Content script running")

function parseAndExtractHTML(htmlString){
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(htmlString, "text/html");

  const links = parsedHtml.querySelectorAll('a').forEach((link) => { links.push({data: link.href, type: 'link'}) });
  const images = parsedHtml.querySelectorAll('img').forEach((image) => { images.push({data: image.src, type: 'image'}) });
  const files = parsedHtml.querySelectorAll(
    'a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".ppt"], a[href$=".pptx"]'
  ).forEach((file) => { files.push({data: file.href, type: 'file'}) });

  // const links = [...parsedHtml.querySelectorAll('a')].map(link => link.href);
  // const images = [...parsedHtml.querySelectorAll('img')].map(img => img.src);
  // const files = [...parsedHtml.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".ppt"], a[href$=".pptx"]')].map(file => file.href);

  return  { links, images, files }

  // data.items.push({ type: "html", data: { links, images, files, text } });
}

function handleCopyEvent() {
    const data = {
      items: []
    };
  
    // Get the selected text, if any
    const selectedText = window.getSelection().toString().trim();
    console.log(selectedText)
    if (selectedText) {
      data.items.push({ type: 'text', data: selectedText });
    }
  
    // Get the HTML content, if any
    const selectedHtml = window.getSelection().anchorNode.parentNode.innerHTML.trim();
    console.log(selectedHtml)
    if (selectedHtml) {
      const { links, images, files } = parseAndExtractHTML(selectedHtml)
      console.log(links, images, files)
      data.items.push({ type: "html", data: { links, images, files } });
    }

  
    // Send the data to the background script
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'clipboard-data', data }, (response) => {
        if (response.success) {
            console.log('Copied items categorized successfully');
        } else {
            console.error('Failed to categorize copied items');
        }
        });
    }
  }
  
  document.addEventListener('copy', handleCopyEvent);
  