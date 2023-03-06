const tabs = document.querySelectorAll('.tab');
const tabItems = document.querySelector('.tab-items');

// const activeTab = tabs[0];
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