const popup = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "fromButton" });
    });
};
  
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("romanize").addEventListener("click", popup, false);
});
