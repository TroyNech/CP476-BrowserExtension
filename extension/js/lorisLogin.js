chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);

	var login = JSON.parse(request);

	document.getElementById("UserID").value = login['loris-id'];
	document.getElementsByName("PIN")[0].value = login['loris-pin'];

	//get login button to click
	var inputs = document.getElementsByTagName('input');

	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].value == 'Login') {
			inputs[i].click();
		}
	}

	sendResponse({
		success: true
	});
});