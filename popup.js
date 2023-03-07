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
chrome.runtime.sendMessage({ type: 'get-clipboard-data' }, (response) => {
    console.log(response)
    if (chrome.runtime.lastError) { // if there was an error in accessing clipboard data
        document.querySelector(".tab-items").innerHTML = `<li class="error-message">${chrome.runtime.lastError.message}</li>`;
        return;
    }

    if (response && response.success) {

        const [] d = response.data;
        const activeTab = document.querySelector('.active-tab');
        const activeTabClasses = activeTab.classList;
        const activeTabItems = items.filter((item) => item.type === activeTab.textContent);
        const tabItems = document.querySelector('.tab-items');

        if (activeTabItems.length === 0) {
            const error = document.createElement('div');
            error.className = 'error';
            error.textContent = `No ${type} items found in clipboard`;
            tabItems.appendChild(error);
        }else{
            console.log("first")
        }

        console.log(activeTabClasses, activeTabItems)

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

const closeButton = document.querySelector('.close');
closeButton.addEventListener('click', () => {
  window.close();
});