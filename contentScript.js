console.log("Content script running")
function handleCopyEvent(event) {
    const data = {
    //   text: '',
    //   html: '',
      items: [],
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
      data.items.push({ type: 'html', data: selectedHtml });
    }
  
    // Get the copied items, if any
    const clipboardData = event.clipboardData || window.clipboardData;
    console.log("clipboard", clipboardData);
    if (clipboardData) {
        console.log("clipboard", clipboardData);
      const types = clipboardData.types;
      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const item = clipboardData.getData(type);
        switch (type) {
          case 'text/plain':
            data.items.push({ type: 'text', data: item });
            break;
          case 'text/html':
            data.items.push({ type: 'html', data: item });
            break;
          case 'image/png':
          case 'image/jpeg':
          case 'image/gif':
            data.items.push({ type: 'image', data: item });
            break;
          default:
            data.items.push({ type: 'file', data: item });
            break;
        }
      }
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
  