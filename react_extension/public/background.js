chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
        console.log("The color is green.");
    });


    function renderInfo(info, tab) {
        console.log("item " + info.selectionText + " was clicked");
        console.log("info: " + JSON.stringify(info));
        console.log("tab: " + JSON.stringify(tab));
        chrome.windows.create({
            url : "index.html/?q="+info.selectionText,
            focused : true,
            type : "popup"});
    }
    var title = "Search %s via OneProfile";
    var id = chrome.contextMenus.create({"title": "Search \"%s\" via OneProfile",
									                       "contexts":["selection"],
                                         "onclick": renderInfo});
});
