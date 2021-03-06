var serverUrl = "http://anthonyswebsite.com/CP476Final/";

//listeners for extension.html

//Toggle accordian icons. Look for .svg since fa js inserts svg into i
$('#action-accordion .collapsible-header').focusout(function () {
	if (!$(this).closest('li').hasClass('active')) {
		$(this).find('svg').removeClass('fa-caret-down');
		$(this).find('svg').addClass('fa-caret-right');
	}
});
$('#action-accordion .collapsible-header').click(function () {
	$(this).find('svg').toggleClass('fa-caret-down fa-caret-right');
});

//monitor whenever url changes while popup is open
//make sure proper registration and add schedule tabs are properly set if not on VSB
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url.includes("https://scheduleme.wlu.ca/vsb")) {
		$('#add-schedule-tab').addClass('collapse-disabled');
		$('#register-courses-tab').addClass('hide');
	}
});

//Handle click on forgot-password a
$('#forgot-password').click(function (event) {
	event.preventDefault();
});

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

			instance = M.Modal.getInstance(modal);
			instance.open()
			modal.blur();

			setTimeout(function () {
				instance.close();
				//switch login tab to logout
				logIn($('#login-email').val());
			}, 2000);
		} else if (data['result'].includes('Duplicate')) {
			alert("This email is already registed!");
		} else {
			console.log("Unexepected data from server");
			console.log(data);
		}
	});
});

//logout listener
$('#logout-tab').click(function () {
	//clear memory
	chrome.storage.sync.remove("laurier-link");

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

	//get course data
	var code = $('#add-course-code').val();
	var term = $('#term').val();

	//extract info from code
	var depart = code.substr(0, 2).toUpperCase();
	var numb = code.substr(2).trim();

	//need to get year and month from term
	var date = new Date();
	var year;
	var month;

	if (term == "Winter") {
		year = date.getFullYear() + 1;
		month = 01;
	} else if (term == "Fall") {
		year = date.getFullYear();
		month = 09;
	}
	//is Spring
	else {
		date.setDate(date.getMonth() + 1);
		year = date.getFullYear();
		month = 05;
	}

	var url = "https://loris.wlu.ca/ssb_prod/bwckctlg.p_disp_course_detail?cat_term_in=" +
		year.toString() + month.toString().padStart(2, '0') + "&subj_code_in=" + depart + "&crse_numb_in=" + numb;

	var toSend = {};
	var get = $.get(url);
	get.done(function (response) {
		var info = $(response).find('.nttitle');

		if (info.length == 0) {
			$('#add-course-code').addClass('invalid');
			return;
		}

		toSend['title'] = info.get(0).innerText;
		toSend['description'] = $(response).find('.ntdefault').get(0).outerHTML;

		toSend['term'] = term;
		toSend['add-course-code'] = depart + " " + numb;
		toSend['login-email'] = userData['email'];

		var post = $.post(serverUrl + "add-course-controller.php", toSend, function () {});
		post.fail(function () {
			console.log("Add course request to server failed");
		});
		post.done(function (data) {
			data = JSON.parse(data);

			if (data['description'] != null) {
				var msg = $('#course-added-msg');
				msg.removeClass('hide');
				msg.hide();
				msg.fadeIn(400, function () {
					setTimeout(2000, function () {
						msg.fadeOut(400, function () {
							msg.addClass('hide');
						});
					});
				});

				var course = data;

				//add course to saved-courses tab
				var courseItem = $('#clone').clone();
				courseItem.removeClass('hide');
				courseItem.attr('id', course['id']);
				$('#saved-courses-collection').append(courseItem);
				courseItem.find('.saved-item span').html(course['title']);
				courseItem.find('.saved-item-remove').on("click", savedItemRemove);
				courseItem.find('.saved-item').on("click", savedCourseOpenDetail);

				//remove any invalid class on code input
				$('#add-course-code').removeClass('invalid');

				//add to courses list and write back to storage
				userData['courses'][course['id']] = course;
				/* 				chrome.storage.sync.set({
									"laurier-link": userData
								}, function () {
									console.log('Value is set to ' + userData);
								}); */
			} else {
				$('#add-course-code').addClass('invalid');
				console.log("Unexepected data from server");
			}
		});
	})
});

//add schedule listener
$('#add-schedule-submit').click(function () {
	//verify that a schedule name is given
	if ($('#add-schedule-name').val().length === 0) {
		return;
	}

	//submit form to server

	var toSend = {}
	toSend['schedule-name'] = $('#add-schedule-name').val();

	chrome.tabs.query({
		'active': true,
		'currentWindow': true,
	}, function (tabs) {
		toSend['schedule-link'] = encodeURIComponent(tabs[0].url);

		toSend['login-email'] = userData['email'];

		var post = $.post(serverUrl + "add-schedule-controller.php", toSend, function () {});
		post.fail(function () {
			console.log("Add schedule request to server failed");
		});
		post.done(function (response) {
			data = JSON.parse(response);

			if ('id' in data) {
				var msg = $('#schedule-added-msg');
				msg.removeClass('hide');
				msg.hide();
				msg.fadeIn(400, function () {
					setTimeout(2000, function () {
						msg.fadeOut(400, function () {
							msg.addClass('hide');
						});
					});
				});

				var schedule = data;

				//add course to saved-courses tab
				var scheduleItem = $('template .collection-item').clone();
				scheduleItem.attr('id', schedule['id']);
				scheduleItem.find('.saved-item span').val(schedule['add-name']);
				$('#saved-schedules-collection').append(scheduleItem);

				//add to schedules list and write back to storage
				userData['schedules'][schedule['id']] = schedule;
				/* 			chrome.storage.sync.set({
								"laurier-link": userData
							}, function () {
								console.log('Value is set to ' + userData);
							}); */


				//add schedule to saved-schedule tab
				var scheduleItem = $('#clone').clone();
				scheduleItem.removeClass('hide');
				scheduleItem.attr('id', schedule['id']);
				$('#saved-schedules-collection').append(scheduleItem);
				scheduleItem.find('.saved-item span').html(schedule['name']);
				scheduleItem.find('.saved-item-remove').on("click", savedItemRemove);
				scheduleItem.find('.saved-item').on("click", savedScheduleOpen);
			} else {
				console.log("Unexepected data from server");
			}
		});
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
	var post = $.post(serverUrl + "remove-all-courses-controller.php", 'ALL', function () {});
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
	var post = $.post(serverUrl + "remove-all-schedules-controller.php", 'ALL', function () {});
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

function savedItemRemove(event) {
	event.preventDefault();
	var item = $(event.target.closest('.collection-item'));
	var itemId = item.attr('id');
	var collection = item.closest('.collection');

	//if schedule collection, remove schedule
	if (collection.attr('id') == "saved-schedules-collection") {
		delete userData['schedules'][itemId];

		var post = $.post(serverUrl + "remove-schedule-controller.php", {
			'schedule-id': itemId
		}, function () {});
		post.fail(function () {
			console.log('Remove schedule request to server failed');
		});
	}
	//else, course collection, remove course
	else {
		delete userData['courses'][itemId];
		var post = $.post(serverUrl + "remove-course-controller.php", {
			'course-id': itemId
		}, function () {});
		post.fail(function () {
			console.log('Remove course request to server failed');
		});
	}

	//remove item from UI
	//nowrap prevents item from expanding vertically as it slides off screen
	item.find('span').css('white-space', 'nowrap');
	item.css('margin-left', '26em');

	setTimeout(function () {
		item.remove();
	}, 600);
}

$('#add-schedule-tab').click(function () {
	//if disabled b/c not logged in, do nothing
	if ($(this).hasClass('disabled')) {
		return;
	}

	//if disabled b/c not on vsb, then enable and go to vsb
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
function savedCourseOpenDetail(event) {
	//check whether course detail page is open in current page
	chrome.tabs.query({
		'active': true,
		'currentWindow': true,
	}, function (tabs) {
		var courseId = $(event.target).closest('.collection-item').attr('id');
		var url = tabs[0].url;

		//if not on course detail page, open it
		if (!tabs[0].url.includes("courseDetail")) {
			chrome.tabs.update({
				'url': "html/courseDetail.html"
			}, function (tab) {
				$('#add-schedule-tab').addClass('collapse-disable');
				$('#register-courses-tab').addClass('hide');

				//need timeout to allow page to load
				setTimeout(function () {
					//send msg to content script to modify page
					chrome.runtime.sendMessage(chrome.runtime.id, JSON.stringify(userData['courses'][courseId]), function (response) {});
				}, 1000);

			});
		} else {
			//send msg to content script to modify page
			chrome.runtime.sendMessage(chrome.runtime.id, JSON.stringify(userData['courses'][courseId]), function (response) {
				console.log(response);
			});
		}
	});
}

//open schedule on saved schedule item click
function savedScheduleOpen(event) {
	var scheduleId = $(event.target).closest('.collection-item').attr('id');
	var link = decodeURIComponent(userData['schedules'][scheduleId]['link']);

	chrome.tabs.update({
		'url': link
	}, function () {
		$('#add-schedule-tab').removeClass('collapse-disabled');
		$('#register-courses-tab').removeClass('hide');
	});
}

//open register modal on register on courses tab click
$('#register-courses-tab').click(function (event) {
	event.preventDefault();

	var modal = $('#loris-login-modal');
	M.Modal.init(modal, null);
	var instance = M.Modal.getInstance(modal);
	instance.open();

	//set size of popup to max size, since modal is large
	var height = $('html').css('max-height');
	$('html').css('height', height);
});

//validate input on loris login submit
//and then open loris if valid
$('#loris-login-submit').click(function () {
	//check to make sure that the fields aren't blank
	if ($('#loris-id').val().length === 0 || $('#loris-pin').val().length === 0) {
		return;
	}

	//get id of current tab
	chrome.tabs.query({
		'active': true,
		'currentWindow': true,
		'url': 'https://scheduleme.wlu.ca/vsb/*'
	}, function (tabs) {

		if ($.isEmptyObject(tabs)) {
			console.log('Unable to  register courses. Not on VSB page');
			return;
		}

		//send msg to content script to get crns
		chrome.tabs.sendMessage(tabs[0].id, {
			'msg': 'hi'
		}, function (response) {

			var crns = {};
			crns['crns'] = response['data'];

			//redirect to loris login, fill in values and attempt to login
			//if not register page, alert
			chrome.tabs.update({
				'url': "https://loris.wlu.ca/ssb_prod/twbkwbis.P_ValLogin"
			}, function () {

				//wait for page to load
				setTimeout(function () {
					var toSend = {};
					toSend['loris-id'] = $('#loris-id').val();
					toSend['loris-pin'] = $('#loris-pin').val();

					//send msg to content script to modify page
					chrome.tabs.sendMessage(tabs[0].id, JSON.stringify(toSend), function (response) {
						//check whether still on login page
						if (response['success'] != true) {
							//if still on login, return
							return;
						}

						//else, open register for course page
						//wait for page to load
						setTimeout(function () {
							chrome.tabs.update({
								'url': "https://loris.wlu.ca/ssb_prod/bwskfreg.P_AltPin"
							}, function () {
								//wait for page to load
								setTimeout(function () {
									//send msg to content script to select term for registration
									chrome.tabs.sendMessage(tabs[0].id, JSON.stringify({
										'msg': 'hi'
									}), function (response) {
										//wait for page to load
										setTimeout(function () {
											//send msg to content script to input crns
											chrome.tabs.sendMessage(tabs[0].id, JSON.stringify(crns), function (response) {
												alert('CRNs added. You will have to click Submit yourself');

												$('#loris-login-cancel').click();
											});
										}, 1500);
									});
								}, 1500);
							});
						}, 1500);
					});
				}, 1500);
			});
		});
	});
});

$('#loris-login-cancel').click(function () {
	var modal = $('#loris-login-modal');
	var instance = M.Modal.getInstance(modal);
	instance.destroy();

	//reset
	$('html').css('height', '');
	$('#register-courses-tab').removeClass('active');

});

$('#help-icon-wrapper').click(function () {
	chrome.tabs.update({
		'url': "html/help.html"
	}, function (tab) {});
});

function logIn(email) {
	userData['email'] = email;
	loggedInTransition();
}

function loggedIn() {
	$('#login-tab').addClass('hide');
	$('#logout-tab').removeClass('hide');
	$('#logout-tab').hide();
	$('#logout-tab').fadeIn();

	changeNonLoginTabs();
}

//switch login tab to logout
function loggedInTransition() {
	$('#login-tab').fadeOut(400, function () {
		$('#login-tab').addClass('hide');
		$('#logout-tab').removeClass('hide');
		$('#logout-tab').hide();
		$('#logout-tab').fadeIn();

		changeNonLoginTabs();
	});
}

function changeNonLoginTabs() {
	$('.disabled').removeClass('disabled');

	var param = {}
	param['user-email'] = userData['email'];

	var get = $.get(serverUrl + "get-courses-controller.php", param, function (results) {});
	get.fail(function (response) {
		console.log('Get courses request to server failed');
	});
	get.done(function (response) {
		var courses = JSON.parse(response)['result'];
		userData['courses'] = {};
		for (var i = 0; i < courses.length; i++) {
			userData['courses'][courses[i]['id']] = courses[i];
		}

		get = $.get(serverUrl + "get-schedules-controller.php", param, function (results) {});
		get.fail(function (response) {
			console.log('Get schedules request to server failed');
		});
		get.done(function (response) {
			var schedules = JSON.parse(response)['result'];
			userData['schedules'] = {};
			for (var i = 0; i < schedules.length; i++) {
				userData['schedules'][schedules[i]['id']] = schedules[i];
			}

			addItems();

			var toWrite = {};
			toWrite['email'] = userData['email'];

			//write to memory
			chrome.storage.sync.set({
				"laurier-link": toWrite
			}, function () {});
		});
	});
}

function addItems() {
	addCourses();
	addSchedules();
}

function addCourses() {
	var courses = userData['courses'];
	for (let key of Object.keys(courses)) {
		var course = courses[key];

		//add course to saved-courses tab
		var courseItem = $('#clone').clone();
		courseItem.removeClass('hide');
		courseItem.attr('id', course['id']);
		$('#saved-courses-collection').append(courseItem);
		courseItem.find('.saved-item span').html(course['title']);
		courseItem.find('.saved-item-remove').on("click", savedItemRemove);
		courseItem.find('.saved-item').on("click", savedCourseOpenDetail);
	}
}

function addSchedules() {
	var schedules = userData['schedules'];
	for (let key of Object.keys(schedules)) {
		var schedule = schedules[key];

		//add schedule to saved-schedule tab
		var scheduleItem = $('#clone').clone();
		scheduleItem.removeClass('hide');
		scheduleItem.attr('id', schedule['id']);
		$('#saved-schedules-collection').append(scheduleItem);
		scheduleItem.find('.saved-item span').html(schedule['name']);
		scheduleItem.find('.saved-item-remove').on("click", savedItemRemove);
		scheduleItem.find('.saved-item').on("click", savedScheduleOpen);
	}
}