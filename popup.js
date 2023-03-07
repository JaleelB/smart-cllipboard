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
setActiveTab(activeTabIndex)

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activeTabIndex = index;
      setActiveTab(activeTabIndex);
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

            const { text, file, image, link } = response.data;
            const clipboardData = [ ...text, ...file, ...image, ...link  ];
            console.log(clipboardData)
            const activeTab = document.querySelector('.active-tab');
            // const activeTabClasses = activeTab.classList;
            const activeTabItems = clipboardData.filter((clipboardItem) => clipboardItem.type === activeTab.textContent);

            if (activeTabItems.length === 0) {
                const error = document.createElement('div');
                error.className = 'error';
                error.textContent = `No ${type} items found in clipboard`;
                tabItems.appendChild(error);
            }else{
                activeTabItems.forEach((item) => {
                    const li = document.createElement('li');
                    li.classList.add("tab-item")

                    if (item.type === 'text') {
                    li.textContent = item.data;
                    } else if (item.type === 'link' || item.type === 'image' || item.type === 'file') {
                    const link = document.createElement('a');
                    link.href = item.data;
                    link.textContent = item.data;
                    li.appendChild(link);
                    }
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