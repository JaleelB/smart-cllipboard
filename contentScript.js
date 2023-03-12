console.log("Content script running")

function parseAndExtractHTML(htmlString){
  const parsedHtml = new DOMParser().parseFromString(htmlString, "text/html");
  const links = Array.from(parsedHtml.querySelectorAll('a')).map(link => ({data: link.href, type: 'link'}));
  const images = Array.from(parsedHtml.querySelectorAll('img')).map(image => ({data: image.src, type: 'image'}));
  const files = Array.from(parsedHtml.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".xls"], a[href$=".xlsx"], a[href$=".ppt"], a[href$=".pptx"]')).map(file => ({data: file.href, type: 'file'}));
  const text = Array.from(parsedHtml.querySelectorAll('*'))
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(textNode => ({data: textNode.textContent, type: 'text'}));

  return { text, links, images, files };
}


function handleCopyEvent() {
    const data = {
      items: []
    };
  
    // Get the selected text, if any
    const selectedText = window.getSelection().toString().trim();
     
    if (selectedText) {
      data.items.push({ type: 'text', data: selectedText });
    }
  
    // Get the HTML content, if any
    const selectedHtml = window.getSelection().anchorNode.parentNode.innerHTML.trim();
    console.log(selectedHtml)
    if (selectedHtml) {
      const { text, links, images, files } = parseAndExtractHTML(selectedHtml)
      console.log(text, links, images, files)
      data.items.push({ type: "html", data: { text, links, images, files } });
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
  