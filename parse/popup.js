function fav() {
    var crn;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        crn = chrome.tabs.executeScript(tabs[0].id, {file: "fav.js"});
    });
}

function vsbToLoris() {
    var crn;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        crn = chrome.tabs.executeScript(tabs[0].id, {file: "vsbToLoris.js"});
    });
}

function courseInfo() {

/*var s = document.createElement('script');
s.src = chrome.runtime.getURL('courseInfo.js'); // This is the actual script
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);
*/
    var crn;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        crn = chrome.tabs.executeScript(tabs[0].id, {file: "courseInfo.js"});
    });
}

document.getElementById('fav').addEventListener('click', fav);
document.getElementById('vsbToLoris').addEventListener('click', vsbToLoris);
document.getElementById('courseInfo').addEventListener('click', courseInfo);