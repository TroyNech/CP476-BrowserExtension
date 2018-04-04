chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request);
	var course = JSON.parse(request);

	var title = course['title'];
	var description = course['description'];

	var item = $('<li>');
	item.append('<h3>' + title + '</h3>');
	item.append(description);

	$('ul').append(item);

	sendResponse({
		data: course,
		success: true
	});
});