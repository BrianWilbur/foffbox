var loadingTitle = '<img src="img/loading.gif"/>';
var suggestionMousedOver = false;

/* Hides all alerts within the dialog */
function hideAlerts()
{
	$('#drop-beats-alert-loading').hide();
	$('#drop-beats-alert-success').hide();
	$('#drop-beats-alert-failure').hide();
}

/* Sends the provided URL & Message up to the server. */
function dropBeat()
{
	url = $('#drop-beats-url').val();
	message = $('#drop-beats-message').val();
	signUp = true;
	email = null;

	message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

	$('#drop-beats-alert-success').hide();
	$('#drop-beats-alert-failure').hide();

	$('#drop-beat').prop('disabled', true);
	$('#drop-beats-alert-loading').show();

	$.ajax({
		type: 'POST',
		url: '../process-form.php',
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
			$('#drop-beats-alert-loading').hide();

			if (data['success'])
			{
				var successMessage = data['message'];
				//On success, clear out all the fields and re-focus the first text box so you can enter a new song right away
				$('#drop-beats-url').val('');
				$('#drop-beats-message').val('');
				$('#drop-beats-message').trigger('keypress');
				$('#drop-beats-url').focus();
				$('#drop-beats-alert-success').show();
				$('#drop-beats-alert-success-message').html(successMessage);
			}
			else
			{
				var errorMessage = data['message'];
				$('#drop-beats-alert-failure').html(errorMessage).show();
			}

			$('#drop-beat').prop('disabled', false);
		},
		error: function(err)
		{
			$('#drop-beats-alert-loading').hide();
			$('#drop-beats-alert-success').hide();
			$('#drop-beats-alert-failure').html("Something went very wrong, and we're not quite sure what. Try again later.").show();
			$('#drop-beat').prop('disabled', false);
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
		url: '../get-suggestions.php',
		dataType: 'text',
		success: function(message)
		{
			if (suggestionMousedOver)
			{
				$('#drop-beats-suggestion').attr('title', message).tooltip('fixTitle');
				$('#drop-beats-suggestion').tooltip('show');
			}
		},
		error: function()
		{
			$('#drop-beats-suggestion').attr('title', "Ask again later.<br><br>(Something went wrong.)").tooltip('fixTitle').tooltip('show');
		}
	});
}

/* "Drop beats" dialog stuff */
$(document).on('keydown', '#drop-beats-url, #drop-beats-message', function(event) {
	hideAlerts();
});

/* "Drop beats" dialog - characters remaining */
$(document).on('keypress keyup keydown', '#drop-beats-message', function(event) {
	var charsTyped = $(this).val().length;
	var maxlength = $(this).attr('maxlength');
	var remaining = maxlength - charsTyped;

	$('#drop-beats-message-remaining').html(remaining + '/' + maxlength + ' remaining');
});

/* When the "Drop beats" UI button is clicked, reset all text fields in the dialog */
$(document).on('click', '#foffbox-player-drop', function(event){
	$('#drop-beats-alert-loading').hide();
	$('#drop-beats-alert-success').hide();
	$('#drop-beats-alert-failure').hide();
	$('#drop-beats-message, #drop-beats-url').val('');
	$('#drop-beats-message').trigger('keypress');
});

/* Called when the modal is finished loading/being shown */
$('#drop-beats-modal').on('shown.bs.modal', function() {
    $('#drop-beats-url').focus();
});

/* When you click "Drop beat"...drop a beat! */
$(document).on('click', '#drop-beat', function(event){
	event.preventDefault();
	dropBeat();
});

$(document).on('ready', function(event){
	//This specific tooltip should be on top
	$('#drop-beats-suggestion').tooltip({'placement': 'top', 'html': true, 'container':'body'});

	//Show suggestions on mouseover/click
	$('#drop-beats-suggestion').on('mouseover click', function(event){
		$('#drop-beats-suggestion').attr('title', loadingTitle).tooltip('fixTitle').tooltip('show');
		suggestionMousedOver = true;
		getSongSuggestion();
	});
	$('#drop-beats-suggestion').on('mouseout', function(event){
		suggestionMousedOver = false;
	});
});