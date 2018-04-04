var serverUrl = "http://anthonyswebsite.com/CP476Final/";
var storageKey = "laurier-link";
var userData = [];

//Initialize collapsible elements
var elem = $('.collapsible');
var instance = M.Collapsible.init(elem, null);

//Initialize select elements
var elem = $('select');
var instance = M.FormSelect.init(elem, null);

//read storage and setup extension
chrome.storage.sync.get(storageKey, function (result) {
	console.log('initial setup start');
	console.log(result);
	console.log(JSON.parse(result));
	console.log('initial setup end');

	if (jQuery.isEmptyObject(result)) {
		return;
	}

	userData = JSON.parse(result);

	//if login key exists, then logged in
	if (!('login' in userData)) {
		return;
	}

	//else, logged in
	loggedIn();
});

//if on vsb, make add schedule tab a dropdown
//and enable register tab
chrome.tabs.query({
	'active': true,
	'currentWindow': true,
	'url': 'https://scheduleme.wlu.ca/vsb/*'
}, function (tabs) {
	if (tabs != null) {
		$('#add-schedule-tab').removeClass('collapse-disabled');
		$('#register-courses-tab').removeClass('hide');
	}
});

//listeners for extension.html

//Toggle accordian icons. Look for .svg since fa js inserts svg into i
$('#action-accordion .collapsible-header').click(function () {
	$(this).find('svg').toggleClass('fa-caret-right fa-caret-down');
})

//Handle click on forgot-password a
$('#forgot-password').click(function (event) {
	event.preventDefault();
})

//disable form submittion
$('form').submit(false);

//on login submit
//rely on browser to do front-end validation (back-end will do final validation)
//trigger fade-in fade-out success modal on good login
$('#login-submit').click(function () {
	//check to make sure that the browser hasn't marked any of the fields invalid
	//won't be marked invalid if user hasn't clicked in it, so check length too
	if ($('#login-form input').hasClass('invalid') ||
		$('#login-email').val().length === 0 || $('#login-password').val().length === 0) {
		return;
	}

	var post = $.post(serverUrl + "login-controller.php", $('#login-form').serialize(), function () {});
	post.fail(function () {
		console.log("Login request to server failed");
	});
	post.done(function (data) {
		data = JSON.parse(data);
		if (data['result'] == true) {
			var modal = $('#login-success-modal');
			var instance = M.Modal.init(modal, {
				'inDuration': 1000,
				'outDuration': 1000
			});
			instance = M.Modal.getInstance(modal);
			instance.open()
			modal.blur();
			var email = $('#login-email').val();

			setTimeout(function () {
				instance.close();
				setTimeout(function () {
					logIn(email);
				});
			}, 1000);
		} else if (data['result'] == false) {
			alert("Your login is invalid!");
		} else {
			console.log("Unexepected data from server");
		}
	});
});

//register button listener
$('#registration-submit').click(function () {
	//show confirm password field if not already
	if ($('#confirm-password-wrapper').hasClass('hide')) {
		$('#confirm-password-wrapper').removeClass('hide');
		return;
	}

	//else, check to see if any fields invalid
	if ($('#login-form input').hasClass('invalid') || $('#login-email').val().length === 0) {
		return;
	}

	//else, check if passwords match
	//if not, make sure confirm-password is marked invalid
	if ($('#confirm-password').val().length === 0 ||
		$('#login-password').val() !== $('#confirm-password').val()) {
		$('#confirm-password').addClass('invalid');
		return;
	}

	//else, passwords match
	//send to server
	var post = $.post(serverUrl + "registration-controller.php", $('#login-form').serialize(), function () {});
	post.fail(function () {
		console.log("Registration request to server failed");
	});
	post.done(function (data) {
		data = JSON.parse(data);

		if (data['result'] == true) {
			var modal = $('#registration-msg');
			var instance = M.Modal.init(modal, {
				'inDuration': 1000,
				'outDuration': 1000,
			});

			logIn($('#login-email').val());
			instance = M.Modal.getInstance(modal);
			instance.open()
			modal.blur();

			setTimeout(function () {
				instance.close();
			}, 2000);
		} else if (data['result'] == false) {
			alert("Your login is invalid!");
		} else {
			console.log("Unexepected data from server");
		}
	});
});

//logout listener
$('#logout-tab').click(function () {
	//clear memory
	chrome.storage.sync.remove({
		storageKey
	});

	alert('Logged out');

	//close extension
	window.close();
});

//add course listener
$('#add-course-submit').click(function () {
	//verify course code value
	//mark invalid if nothing entered
	if ($('#add-course-code').val().length === 0) {
		$('#add-course-code').addClass('invalid');
		return;
	}

	//else, submit form to server

	var toSend = $('#add-course-form').serializeArray();
	toSend['login-email'] = userData['email'];

	var post = $.post(serverUrl + "add-course-controller.php", JSON.stringify(toSend), function () {});
	post.fail(function () {
		console.log("Add course request to server failed");
	});
	post.done(function (data) {
		data = JSON.parse(data);

		if ('id' in data) {
			var msg = $('#course-added-msg');
			msg.removeClass('hide');
			msg.hide();
			msg.fadeIn(400, function () {
				setTimeout(2000, function () {
					msg.fadeOut('400', function () {
						msg.addClass('hide');
					});
				});
			});

			var course = data;

			//add course to saved-courses tab
			var courseItem = $('template .collection-item').clone();
			courseItem.attr('id', course['id']);
			courseItem.find('.saved-item span').val(course['course-title']);
			$('#saved-courses-collection').append(courseItem);

			//add to courses list and write back to storage
			userData['courses'][course['id']] = course;
			chrome.storage.sync.set({
				storageKey: userData
			}, function () {
				console.log('Value is set to ' + userData);
			});
		} else {
			$('#add-course-code').addClass('invalid');
			console.log("Unexepected data from server");
		}
	});
});

//add schedule listener
$('#add-schedule-submit').click(function () {
	//verify that a schedule name is given
	if ($('#add-schedule-name').val().length === 0) {
		return;
	}

	//submit form to server

	var toSend = $('#add-schedule-form').serializeArray();
	toSend['login-email'] = userData['email'];

	var post = $.post(serverUrl + "add-schedule-controller.php", JSON.stringify(toSend), function () {});
	post.fail(function () {
		console.log("Add schedule request to server failed");
	});
	post.done(function (data) {
		data = JSON.parse(data);

		if ('id' in data) {
			var msg = $('#schedule-added-msg');
			msg.removeClass('hide');
			msg.hide();
			msg.fadeIn(400, function () {
				setTimeout(2000, function () {
					msg.fadeOut('400', function () {
						msg.addClass('hide');
					});
				});
			});

			var schedule = data;

			//add course to saved-courses tab
			var scheduleItem = $('template .collection-item').clone();
			scheduleItem.attr('id', schedule['id']);
			scheduleItem.find('.saved-item span').val(schedule['add-schedule-name']);
			$('#saved-schedules-collection').append(scheduleItem);

			//add to schedules list and write back to storage
			userData['schedules'][schedule['id']] = schedule;
			chrome.storage.sync.set({
				storageKey: userData
			}, function () {
				console.log('Value is set to ' + userData);
			});
		} else {
			console.log("Unexepected data from server");
		}
	});
});

//open modal to confirm remove all courses
$('#remove-courses-btn').click(function () {
	var modal = $('#confirm-remove-courses-modal');
	var instance = M.Modal.init(modal, {});
	instance = M.Modal.getInstance(modal);
	instance.open()
});

//if click confirm remove all courses, remove all courses
$('#confirm-remove-courses-btn').click(function () {
	var post = $.post(serverUrl + "remove-course-controller.php", 'ALL', function () {});
	post.fail(function () {
		console.log("Remove all courses request to server failed");
	});
	post.done(function (data) {
		delete userData['courses'];
	});

	//close modal
	var instance = M.Modal.init(modal, {});
	instance.close()
});

//open modal to confirm remove all schedules
$('#remove-schedules-btn').click(function () {
	var modal = $('#confirm-remove-schedules-modal');
	var instance = M.Modal.init(modal, {});
	instance = M.Modal.getInstance(modal);
	instance.open()
});

//if click confirm remove all schedules, remove all schedules
$('#confirm-remove-schedules-btn').click(function () {
	var post = $.post(serverUrl + "remove-schedules-controller.php", 'ALL', function () {});
	post.fail(function () {
		console.log("Remove all schedules request to server failed");
	});
	post.done(function (data) {
		delete userData['schedules'];
	});

	//close modal
	var instance = M.Modal.init(modal, {});
	instance.close()
});


//saved item remove icon listener
$('.saved-item-remove').click(function (event) {
	event.preventDefault();

	var item = $(event.target.closest('.collection-item'));
	var itemId = item.attr('id');
	var collection = item.closest('.collection');

	//if schedule collection, remove schedule
	if (collection.attr('id') == "saved-schedules-collection") {
		delete userData['schedules'][itemId];
		var post = $.post(serverUrl + "remove-schedule-controller.php", itemId, function () {});
		post.fail(function () {
			console.log('Remove schedule request to server failed');
		});
	}
	//else, course collection, remove course
	else {
		delete userData['courses'][itemId];
		var post = $.post(serverUrl + "remove-course-controller.php", itemId, function () {});
		post.fail(function () {
			console.log('Remove course request to server failed');
		});
	}

	//remove item from UI
	item.css('margin-left', '26em');

	setTimeout(function () {
		item.remove();
	}, 600);
});


$('#add-schedule-tab').click(function () {
	//if disabled (and not on vsb), then enable and go to vsb
	if ($(this).hasClass('collapse-disabled')) {
		chrome.tabs.update({
			'url': "https://scheduleme.wlu.ca/vsb/"
		}, function () {
			$('#add-schedule-tab').removeClass('collapse-disabled');
			$('#register-courses-tab').removeClass('hide');
		});
	}
})

//open new tab on saved course item click 
$('#saved-courses-tab .saved-item').click(function (event) {
	event.preventDefault();

	//check whether course detail page is open in current page
	chrome.tabs.query({
		'active': true,
		'currentWindow': true,
		'url': 'file:///html/courseDetail.html'
	}, function (tabs) {
		var courseId = $(this).attr('id');

		//if not on course detail page, open it
		if (tabs == null) {
			chrome.tabs.update({
				'url': "html/courseDetail.html"
			}, function () {
				$('#add-schedule-tab').addClass('collapse-disable');
				$('#register-courses-tab').addClass('hide');

				//send msg to content script to modify page
				chrome.tabs.sendMessage(tabs[0].id, userData['courses'][courseId], function (response) {});
			});
		} else {
			//send msg to content script to modify page
			chrome.tabs.sendMessage(tabs[0].id, userData['courses'][courseId], function (response) {});
		}
	});
});

//open schedule on saved schedule item click
$('#saved-schedules-tab .saved-item').click(function (event) {
	event.preventDefault();

	var link = userData['schedules'][$(this).attr('id')]['link']
	chrome.tabs.update({
		'url': link
	}, function () {
		$('#add-schedule-tab').removeClass('collapse-disabled');
		$('#register-courses-tab').removeClass('hide');
	});
});

//open register modal on register on courses tab click
$('register-courses-tab').click(function (event) {
	event.preventDefault();

	var modal = $('#loris-login-modal');
	var instance = M.Modal.init(modal, {});
	instance = M.Modal.getInstance(modal);
	instance.open()
});

//validate input on loris login submit
//and then open loris if valid
$('#loris-login-submit').click(function () {
	//check to make sure that the fields aren't blank
	if ($('#loris-id').val().length === 0 || $('#loris-pin').val().length === 0) {
		return;
	}

	//send msg to content script to get crns
	chrome.tabs.sendMessage(tabs[0].id, {
		'msg': 'hi'
	}, function (crns) {

		//redirect to loris login, fill in values and attempt to login
		//if not register page, alert
		chrome.tabs.update({
			'url': "https://loris.wlu.ca/ssb_prod/twbkwbis.P_ValLogin"
		}, function () {
			//send msg to content script to modify page
			chrome.tabs.sendMessage(tabs[0].id, $('#loris-login-submit').serializeArray(), function (response) {
				//check whether still on login page
				chrome.tabs.query({
					'active': true,
					'currentWindow': true,
					'url': 'https://loris.wlu.ca/ssb_prod/twbkwbis.P_ValLogin'
				}, function (tabs) {
					//if still on login, alert and return
					if (tabs == null) {
						alert("Your login didn't work!");
						return;
					}
					//else, open register for course page
					chrome.tabs.update({
						'url': "https://loris.wlu.ca/ssb_prod/bwskfreg.P_AltPin"
					}, function () {
						//send msg to content script to modify page
						chrome.tabs.sendMessage(tabs[0].id, crns, function (response) {});
					});
				});
			});
		});
	});
})

function logIn(email) {
	//write to memory
	//just need to create login key
	userData['email'] = email;
	chrome.storage.sync.set({
		storageKey: userData
	}, function () {});

	//switch login tab to logout
	loggedIn();
}

//switch login tab to logout
function loggedIn() {
	//	$('.collapsible-header').

	$('#login-tab').fadeOut(400, function () {
		$('#login-tab').addClass('hide');
		$('#logout-tab').removeClass('hide');
		$('#logout-tab').hide();
		$('#logout-tab').fadeIn();
	});
}