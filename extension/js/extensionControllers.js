var serverUrl = "https://laurierlink.herokuapp.com/";

//Initialize collapsible elements
var elem = $('.collapsible');
var instance = M.Collapsible.init(elem, null);

//Initialize select elements
var elem = $('select');
var instance = M.FormSelect.init(elem, null);


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
$('#login-submit').click(function (event) {
	//check to make sure that the browser hasn't marked any of the fields invalid
	//won't be marked invalid if user hasn't clicked in it, so check length too
	if ($('#login-form input').hasClass('invalid') ||
		$('#login-email').val().length === 0 || $('#login-password').val().length === 0) {
		return;
	}

	/*             var post = $.post(serverUrl + "login-controller", $('#login-form').serialize(), function () {});
				post.fail(function () {
					console.log("Login request to server failed");
				});
				post.done(function (data) {
					if (data === "valid") { */
	var modal = $('#login-success-modal');
	var instance = M.Modal.init(modal, {
		'inDuration': 1000,
		'outDuration': 1000,
		'onCloseEnd': loggedIn
	});
	instance = M.Modal.getInstance(modal);
	instance.open()
	modal.blur();

	setTimeout(function () {
		instance.close();
	}, 1000);
	/*  } else if (data === "invalid") {
		alert("Your login is invalid!");
	}
	else {
		console.log("Unexepected data from server");
	}
	}
	 }) 
	 */
});

//register button listener
$('#registration-submit').click(function (event) {
	event.preventDefault();

	//show confirm password field if not already
	if ($('#confirm-password-wrapper').hasClass('hide')) {
		$('#confirm-password-wrapper').addClass('hide');
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
	var post = $.post(serverUrl + "registration-controller", $('#login-form').serialize(), function () {});
	post.fail(function () {
		console.log("Registration request to server failed");
	});
	post.done(function (data) {
		if (data === "valid") {
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
			}, 2000);
		} else if (data === "invalid") {
			alert("Your login is invalid!");
		} else {
			console.log("Unexepected data from server");
		}
	});
});

//logout listener
$('#logout-tab').click(function () {
	//clear memory

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

	//else, submit form
	//send to server
	var post = $.post(serverUrl + "add-course-controller", $('#add-course-form').serialize(), function () {});
	post.fail(function () {
		console.log("Add course request to server failed");
	});
	post.done(function (data) {
		if (data === "valid") {
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
		} else if (data === "invalid") {
			$('#add-course-code').addClass('invalid');
			return;
		} else {
			console.log("Unexepected data from server");
		}
	});
});



function loggedIn() {
	//write to memory that logged in

	//switch login tab to logout
	$('#login-tab').fadeOut(400, function () {
		$('#login-tab').addClass('hide');
		$('#logout-tab').removeClass('hide');
		$('#logout-tab').hide();
		$('#logout-tab').fadeIn();
	});

}