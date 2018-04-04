chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);
	
	var crn = document.getElementById("cartCrns").value;
    crn = str.replace(/[()]/g,"");
    crn = crn.split(" ");

	sendResponse({
		data: crn,
		success: true
	});
});