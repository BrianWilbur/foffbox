var loadingTitle = '<img src="data/img/loading.gif"/>';
var suggestionMousedOver = false;

//On ready, initialize
$(document).ready(function(){
	initialize();
});
 
/*
 * Initializes all of the various fields & their text.
 */
function initialize()
{
	//Focus first text box
	$('#youtube-link').focus();
	
	//Initialize "characters remaining"
	$('#message').trigger('keypress');
	
	//Initialize checkbox trigger
	$('#accept').on('change', function(event){
		if ($(this).is(':checked')) { $('#container-email').show(); }
		else { $('#container-email').hide(); }
	});
	
	//This specific tooltip should be on top
	$('#suggestion').tooltip({
		'container': 'body',
		'html': true,
		'placement': 'top'
	});
	
	//Change suggestion on click/mouseover
	$('#suggestion').on('mouseover click', function(event){
		$('#suggestion').attr('title', loadingTitle).tooltip('fixTitle').tooltip('show');
		suggestionMousedOver = true;
		getSongSuggestion();
	});
	$('#suggestion').on('mouseout', function(event){
		suggestionMousedOver = false;
	});
	
	//Hide alerts
	$('input, textarea').on('keydown', function(event) {
		$('#alert-loading').hide();
		$('#alert-success').hide();
		$('#alert-failure').hide();
	});

	//Show number of characters remaining on the Message field
	$('#message').on('keypress keyup keydown', function(event) {
		var charsTyped = $(this).val().length;
		var maxlength = $(this).attr('maxlength');
		var remaining = maxlength - charsTyped;
		
		$('#message-remaining').html(remaining + ' remaining');
	});
	
	initializeValidation();
	initializeDropBeats();
	
	//Change up the background video
	var randomVideo = Math.floor(Math.random()*(3-1+1)+1);
	$('#bg-video').first('source').attr('src', 'data/vid/video' + randomVideo + '.mp4');
	
	//Position the introductory section correctly
	var navbarBottom = $('.navbar-collapse').offset().top + $('.navbar-collapse').height();
	$('#site-intro-wrapper').css('top', navbarBottom + 'px');
	
	$('#site-intro-close').on('click', function(event){
		$('#site-intro').hide();
	});
}

/*
 * Initializes the form's validation mechanisms.
 */
function initializeValidation()
{
	//Regex (for anything that needs a regex)
	$.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        ""
	);
	
	//Validator for message box
	$.validator.addMethod(
		"validateMessage",
		function(value, element, messageLength) {
			var trimmedValue = $.trim(value);
			trimmedValue.replace("  ", "");
			return (trimmedValue.length >= 5);
		},
		""
	);
	
	$('#foffbox-form').validate({
		rules: {
			youtubeUrl: {
				required: true,
				regex: /((https:\/\/)|(http:\/\/))?((m.)|(www.))?(youtube.com\/watch\?v=)([a-zA-Z0-9\-\_]){9,12}/
			},
			messageBox: {
				required: true,
				validateMessage: $('#message').val()
			},
			email: {
				required: false,
				email: true
			}
		},
		messages: {
			youtubeUrl: {
				required: "Put something in the box, dude.",
				regex: "Try something more like this: <span class='txt-fixed'>https://www.youtube.com/watch?v=ZZ5LpwO-An4</span>",
			},
			messageBox: {
				required: "Don't just stay silent!",
				validateMessage: "Try entering something a little more legit.",
			},
			email: {
				required: "You forgot to enter an e-mail address!",
				email: "That ain't no e-mail address."
			}
		}
	});
}

/*
 * Initialize the "Drop Beats" button functionality
 */
function initializeDropBeats()
{
	/*
	 * Submits the content of the form via AJAX. Returns a JSON error if something screws up.
	 */
	$('#drop-beat').on('click', function(event){
		event.preventDefault();
		
		if ($('#foffbox-form').valid())
		{
			url = $('#youtube-link').val();
			message = $('#message').val();
			signUp = true;
			email = $('#email').val();

			message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
			
			$('#alert-success').hide();
			$('#alert-failure').hide();
			
			$('#drop-beat').prop('disabled', true);
			$('#alert-loading').show();
			
			$.ajax({
				type: 'POST',
				url: 'process-form.php',
				dataType: 'json',
				data:
				{
					youtubeUrl:url,
					message:message,
					signUp:signUp,
					emailAddress:email
				},
				success: function(data)
				{
					$('#alert-loading').hide();
				
					if (data['success'])
					{
						var successMessage = data['message'];
						//On success, clear out all the fields and re-focus the first text box so you can enter a new song right away
						$('#youtube-link').val('');
						$('#message').val('');
						$('#youtube-link').focus();
						$('#message').trigger('keypress');
						$('#alert-success').show();
						$('#success-message').html(successMessage);
					}
					else
					{
						var errorMessage = data['message'];
						$('#alert-failure').html(errorMessage).show();
					}
					
					$('#drop-beat').prop('disabled', false);
				},
				error: function(err)
				{
					$('#alert-loading').hide();
					$('#alert-success').hide();
					$('#alert-failure').html("Something went very wrong, and we're not quite sure what. Try again later.").show();
					$('#drop-beat').prop('disabled', false);
				}
			});
		}
	});
}

/*
 * Gets a new song suggestion and inserts it into the tooltip on mouseover.
 */
function getSongSuggestion()
{
	$.ajax({
		type: 'GET',
		url: 'get-suggestions.php',
		dataType: 'text',
		success: function(message)
		{
			if (suggestionMousedOver)
			{
				$('#suggestion').attr('title', message).tooltip('fixTitle');
				$('#suggestion').tooltip('show');
			}
		},
		error: function()
		{
			$('#suggestion').attr('title', "Ask again later.<br><br>(Something went wrong.)").tooltip('fixTitle').tooltip('show');
		}
	});
}