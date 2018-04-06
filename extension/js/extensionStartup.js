var userData = {};

//Initialize collapsible elements
var elem = $('.collapsible');
var instance = M.Collapsible.init(elem, null);

//Initialize select elements
var elem = $('select');
var instance = M.FormSelect.init(elem, null);

//read storage and setup extension
chrome.storage.sync.get("laurier-link", function (result) {
	if (jQuery.isEmptyObject(result)) {
		return;
	}

	//else, logged in
	userData = result['laurier-link'];

	loggedIn();
});

//if on vsb, make add schedule tab a dropdown
//and enable register tab
chrome.tabs.query({
	'active': true,
	'currentWindow': true,
	'url': 'https://scheduleme.wlu.ca/vsb/*'
}, function (tabs) {
	if (!($.isEmptyObject(tabs))) {
		$('#add-schedule-tab').removeClass('collapse-disabled');
		$('#register-courses-tab').removeClass('hide');
	}
});

//disable form submittion
$('form').submit(false);