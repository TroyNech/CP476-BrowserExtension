chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);

	var crns = JSON.parse(request);

	var termSelect = document.getElementById("term_id");

	//if need to select term
	if (termSelect != null) {
		//get submit button to click
		var inputs = document.getElementsByTagName('input');

		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].value == 'Submit') {
				inputs[i].click();
			}
		}

		//timeout to let page load
		setTimeout(function () {}, 2000);
	}

	for (var i = 0; i < crns.length - 1; i++) {
		document.getElementById('crn_id' + (i + 1)).value = crns[i];
	}
	
	sendResponse({
		success: true
	});
});