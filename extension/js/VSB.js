chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var crns = document.getElementById("cartCrns").value;

    crns = crns.replace(/[()]/g,"");
	crns = crns.split(" ");

	var toSend = {};
	toSend['data'] = crns;
	toSend['success'] = true;

	sendResponse(toSend);
});