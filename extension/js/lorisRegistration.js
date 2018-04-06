chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	request  = JSON.parse(request);

	//if request to input crns
	if ("crns" in request) {
		var crns = request['crns'];

		for (var i = 0; i < crns.length; i++) {
			document.getElementById('crn_id' + (i + 1)).value = crns[i];
		}
	}
	//else, request to select term
	else {
		//get submit button to click to submit term selection
		var inputs = document.getElementsByTagName('input');

		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].value == 'Submit') {
				inputs[i].click();
			}
		}
	}

	sendResponse({
		success: true
	});
});