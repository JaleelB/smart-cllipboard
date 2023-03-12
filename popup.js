const tabs = document.querySelectorAll('.tab');
const tabItems = document.querySelector('.tab-items');
let activeTabIndex = 0;

function setActiveTab(activeTabIndex){

    let activeTab = document.querySelector('.active-tab');
    if(!activeTab) {
        activeTab = tabs[activeTabIndex];
        activeTab.classList.add("active-tab");
    }else{
        activeTab.classList.remove("active-tab");
        activeTab = tabs[activeTabIndex];
        activeTab.classList.add("active-tab");
    }

}

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activeTabIndex = index;
      setActiveTab(activeTabIndex);
      tabItems.innerHTML = "";
      showClipboardItems()
    });
});

// Get the clipboard data from the background script
function showClipboardItems() {
    chrome.runtime.sendMessage({ type: 'get-clipboard-data' }, (response) => {
        
        if (chrome.runtime.lastError) { // if there was an error in accessing clipboard data
            document.querySelector(".tab-items").innerHTML = `<li class="error-message">${chrome.runtime.lastError.message}</li>`;
            return;
        }

        if (response && response.success) {

            const { file, image, link, text } = response.data;
            console.log(file, image, link)
            const clipboardData = [  
                ...(text.length > 0 ? text : []),
                ...(file.length > 0 ? file : []),
                ...(image.length > 0 ? image : []),
                ...(link.length > 0 ? link : []),
            ]

            console.log("clipboard data: ", clipboardData)
            
            const activeTab = document.querySelector('.active-tab');
            const activeTabItems = clipboardData.filter((clipboardItem) => `${clipboardItem.type}s` === activeTab.textContent || clipboardItem.type === activeTab.textContent);
            activeTabItems.reverse(); // shows the latest addition to the clipboard as the first item
            console.log(activeTabItems)

            if (activeTabItems.length === 0) {
                const error = document.createElement('div');
                error.className = 'error';
                error.textContent = `No ${activeTab.textContent} found in clipboard`;
                tabItems.style.display = 'grid';
                tabItems.style.placeItems = 'center'
                tabItems.appendChild(error);
            }else{

                tabItems.style.display = 'block';

                activeTabItems.forEach((item) => {
                    console.log("tab item: ", item.type)
                    const li = document.createElement('li');
                    li.classList.add("tab-item");

                    if (item.type === 'text') {
                        li.textContent = item.data;
                    }
                    else if (item.type === 'link' || item.type === 'image' || item.type === 'file') {
                        const link = document.createElement('a');
                        link.href = item.data;
                        link.textContent = item.data;
                        li.appendChild(link);
                    }
                    
                    // } else if (item.type === 'link' || item.type === 'image' || item.type === 'file') {
                    //     const link = document.createElement('a');
                    //     link.href = item.data;
                    //     link.textContent = item.data;
                    //     li.appendChild(link);
                    // }
                    tabItems.appendChild(li);
                });
            }

        }else {
            // Handle the case where the response is undefined or doesn't have a success property
            const errorMessage = document.createElement('li');
            const tabItems = document.querySelector('.tab-items');

            errorMessage.classList.add('error');
            errorMessage.textContent = 'Unable to access clipboard data. Please try again.';
            
            tabItems.style.display = 'grid';
            tabItems.style.placeItems = 'center';
            tabItems.style.fontSize = '15px';
            tabItems.appendChild(errorMessage);
        }
    });
}

const closeButton = document.querySelector('.close');
closeButton.addEventListener('click', () => {
  window.close();
});

setActiveTab(activeTabIndex)
showClipboardItems();// render the clipboard items on popup load