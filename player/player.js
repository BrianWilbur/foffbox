var previousId = 0;
var currentId = 0;
var maxId = 0;
var reported = false;
var vidTitle = '';
var aspectRatio = '';

var show_video = false;

var quality = "medium";
var qualityPopoverTextSet = false;
var volumePopoverTextSet = false;
var commentAreaOpen = false;

var volume = 50;

//Turn on autoplay automatically on first play
var playerStopped = true;

//Play modes
var shuffle = false;
var autoplay = false;

(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

//Initialize a new Youtube player
var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('foffbox-player-video', {
		height: '600',
		width: '600',
		mediaContentUrl: '',
		videoId: '',
		playerVars: {
			autoplay: 0,
			color: 'white',
			controls: 0,
			iv_load_policy: 3,
			modestbranding: 0,
			rel: 0,
			showinfo: 0,
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

/* Start requesting songs when the player first becomes ready */
function onPlayerReady(event)
{
	//If they have a URL already in their hash, go to that ID. Otherwise, request a new (random) song.
	var windowHash = window.location.hash;
	windowHash = windowHash.replace('#', '');
	
	var validHash = false;
	if (windowHash)
	{
		if (!isNaN(windowHash))
		{
			requestNewSong(windowHash);
			validHash = true;
		}
	}
	
	//If we didn't find a valid number after the URL Hash (or there wasn't a hash), just pick a random song.
	if (!validHash)
	{
		requestNewSong(-1);
	}
}

/* Need to head right on in to the next song when the video ends */
function onPlayerStateChange(event)
{
	if(event.data === 0)
	{
		shuffle ? requestNewSong(-1) : requestNewSong(currentId+1);
	}
	
	//Video is playing
	else if (event.data === 1)
	{
		$('#foffbox-player-play-pause').html('<span class="glyphicon glyphicon-pause"></span>');
		playerStopped = false;
		event.target.setPlaybackQuality(quality);
	}
	
	//Video is paused
	else if (event.data === 2 || event.data === 5)
	{
		$('#foffbox-player-play-pause').html('<span class="glyphicon glyphicon-play"></span>');
		playerStopped = true;
	}
	
	else if (event.data === 3)
	{
		event.target.setPlaybackQuality(quality);
	}
}

/* Gets the title of the current video by ID and appends it to the appropriate element. */
function getSongTitle(vidId)
{
	$.get('https://gdata.youtube.com/feeds/api/videos/' + vidId + '?v=2&alt=jsonc', function(data) {
		var aspectRatio = data.data.aspectRatio;
		vidTitle = data.data.title;
		
		//Some minor title formatting (since Youtube titles are weird)
		vidTitle = vidTitle.replace('  ', ' ');
		
		//Reset height and width
		$('#foffbox-player-video').css('height', '100%');
		$('#foffbox-player-video').css('width', '100%');
		
		if (aspectRatio == "widescreen")
		{
			//Do widescreen stuff
			/*var proposedHeight = $('#foffbox-player-video').width() * 0.5625;
			var oldHeight = $('#foffbox-player-video').height();
			var newHeight = $('#foffbox-player-video').height(proposedHeight);
			
			var heightDiff = Math.abs(newHeight - oldHeight);
			var currentTop = $('#foffbox-player-video').top();
			var topDiff = currentTop - heightDiff;
			
			$('#foffbox-player-video').css('top', topDiff + 'px');*/
		}
		else
		{
			//Do not-widescreen stuff
			var height = $('#foffbox-player-video').height();
			var width = height * 1.25;
			$('#foffbox-player-video').css('width', width + 'px');
		}
	});
}

/* Initializes page contents */
function initialize()
{
	$('#loading').show();
	$('#foffbox-player').css('opacity', '0.0');
	$('#comment-error').hide();
}

/* Initializes popover contents */
function initializePopover()
{
	if (!qualityPopoverTextSet)
	{
		//Initialize popover content (it's pretty complicated, so we do it in JS instead of HTML)
		popoverContent = "\
		<div id='quality-highres' class='popover-row'> Over 1080p</div>\
		<div id='quality-1080' class='popover-row'> 1080p (HD)</div>\
		<div id='quality-720' class='popover-row'> 720p (HD)</div>\
		<div id='quality-480' class='popover-row'> 480p</div>\
		<div id='quality-360' class='popover-row popover-row-selected'> 360p</div>\
		<div id='quality-240' class='popover-row'> 240p</div>";
		
		//Initialize Quality popover
		$('#foffbox-player-quality').popover({
			container: 'body',
			content: function() { return popoverContent; },
			html: true,
			placement: 'top',
			title: 'Select Video Quality',
			trigger: 'focus',
		});
		
		qualityPopoverTextSet = true;
	}
	
	if (!volumePopoverTextSet)
	{
		volumePopoverContent = "<input id='volume-slider' type='range' min='0' max='100' step='1' value='50'/>";
		
		//Initialize Quality popover
		$('#foffbox-player-volume').popover({
			container: 'body',
			content: function() { return volumePopoverContent; },
			html: true,
			placement: 'top',
			title: '',
			trigger: 'focus',
		});
		
		$('#foffbox-player-volume').find('.popover-content').css('padding', '10px');
		volumePopoverTextSet = true;
	}
	
	//Toggle popovers on click
	$('#foffbox-player-quality').on('click', function(event){
		$('#foffbox-player-volume').popover('hide');
		$('#foffbox-player-quality').popover('toggle');
	});
	
		//Toggle popovers on click
	$('#foffbox-player-volume').on('click', function(event){
		$('#foffbox-player-volume').popover('toggle');
		$('#foffbox-player-quality').popover('hide');
	});

	$(document).on('click', '.popover-row', function(event)
	{
		//Based on the selected quality, set the 'quality' string to a different value.
		//The 'quality' string is used directly to set the quality of videos each time one is requested.
		switch ($(this).attr('id'))
		{
			case 'quality-highres': quality = "highres"; break;
			case 'quality-1080': quality = "hd1080"; break;
			case 'quality-720': quality = "hd720"; break;
			case 'quality-480': quality = "large"; break;
			case 'quality-360': quality = "medium"; break;
			case 'quality-240': quality = "small"; break;
			default: quality = "medium"; break;
		}
		
		//Remove selection from all existing child elements of this parent
		var children = $(this).parent().children('.popover-row');
		children.each(function(event){
			$(this).removeClass('popover-row-selected');
		});
		
		//Select the element the user clicked, then update the content (otherwise it'll reinitialize every time the user brings up the popover)
		$(this).addClass('popover-row-selected');
		popoverContent = $(this).closest('.popover-content').html();
		
		//Finally, hide the popover (and start hiding the toolbar)
		$('#foffbox-player-quality').popover('hide');
	});
}

/*
 * Given an array with keys 'message' and 'dateSubmitted', this method
 * will render comment data inside the appropriate div.
 */
function renderComments(comments)
{
	$('#comment-thread').html('');
	
	if (comments.length > 0)
	{
		for (var i = 0; i < comments.length; i++)
		{
			var commentNum = comments.length - i; //Since they're sent in descending order by time
			var message = greentext_on_br(comments[i]['message']);
			var date = comments[i]['dateSubmitted'];
			
			renderComment(commentNum, message, date);
		}
	}
	else
	{
		$('#comment-thread').append("<div class=\"well\">No one's given this beat any love. Help it. It's lonely.</div>");
	}
}

/*
 * Renders a single comment into the comment thread list.
 */
function renderComment(commentNum, message, date)
{
	$('#comment-thread').append('\
		<div class="well">\
			<strong>' + commentNum + '. Anonymous</strong>\
			<span class="pull-right comment-subtext">' + date + '</span><br>\
			' + message + '\
		</div>\
	');
}

/* 
 * Requests a new song ID. Will grab the information via ajax POST.
 * If -1 is provided, a random song will be chosen.
 */
function requestNewSong(requestId)
{
	$('#comment-error').hide();

	//Set dat Foffbox player up again
	$('#loading').show();
	$('#foffbox-player-video').css('opacity', '0.0');
	
	//Clear out commend field & comments
	$('#comment-field').val('');

	//Reset the "report" button
	$('#foffbox-player-report').attr('disabled', false);
	$('#foffbox-player-report span').addClass('glyphicon-flag');
	$('#foffbox-player-report span').removeClass('glyphicon-ok');
	$('#foffbox-player-report span').removeClass('foffbox-player-button-active');
	$('#foffbox-player-report').tooltip({
		placement: 'top',
		container: 'body'
	});
	
	//Ping DB and ask for a video
	$.ajax({
		type: 'POST',
		url: 'request-song.php',
		dataType: 'json',
		data:
		{
			requestId:requestId
		},
		success: function(data)
		{
			$('#request-slider').attr('disabled', false);
			$('#request-slider').attr('title', "Slide to jump to another song.");
			$('#request-slider').tooltip('fixTitle').tooltip('hide');
		
			if (data['success'])
			{
				//Load up the appropriate video
				var songUrl = data['submissionUrl'];
				var newUrl = songUrl.replace("watch?v=", "embed/");
				
				var vidId = newUrl.split('embed/')[1];
				getSongTitle(vidId);
				
				newUrl += "?";
				newUrl += "wmode=opaque";
				
				//If Autoplay is turned on, load the video right in and go for it. Otherwise just cue up a new one.
				if (autoplay) player.loadVideoByUrl({mediaContentUrl:newUrl});
				else player.cueVideoByUrl({mediaContentUrl:newUrl});
				
				//Set up the inevitably-beautiful message that was dropped
				var message = greentext_on_br(data['submissionMessage']);
				$('#foffbox-player-quote').find('p').html(message);
				
				//Set up footer
				var songId = data['submissionId'];
				var songDate = data['submissionDate'];
				var songViews = data['views'];
				var viewString = songViews <= 1 ? 'view' : 'views';
				
				
				$('#foffbox-player-quote footer').html(songViews + " " + viewString + ". Dropped on " + songDate + ".");

				//Some last-minute cleanup, then show the goods!
				$('#loading').hide();

				$('#foffbox-player-video').css('opacity', '1.0');
				//$('#foffbox-player-video').height($('#foffbox-player-video').width() * 0.75);

				//Set some IDs for convenience's sake
				currentId = data['submissionId'];
				previousId = data['previousId'];
				
				//Ready for reporting again
				reported = false;
				
				//Collect max ID (so we can use the "Last Submitted Beat" button)
				maxId = data['maxId'];
				
				//Set the URL's hash to include the requested ID (linking to & bookmarking beats! Sweet!)
				document.location.hash = currentId;
				
				//Render comments
				renderComments(data['comments']);
				
				//If the div scrolls, add a little padding to make it look nicer; if not, reset the padding
				//Hard-coded numbers, yuck
				if ($('#comment-thread-wrapper').hasScrollBar())
				{
					$('#comment-thread-wrapper').css('padding-right', '5px');
				}
				else
				{
					$('#comment-thread-wrapper').css('padding-right', '0');
				}
				
				//Adjust request slider
				$('#request-slider').attr('max', maxId);
				$('#request-slider').val(currentId);
				$('#request-slider-val').html('#' + currentId);
				$('#comment-field').focus();
			}
			else
			{
				$('#request-slider').attr('disabled', false);
				$('#loading').html(data['message']);
			}
		},
		error: function(err)
		{
			$('#loading').html('Something went wrong. Wanna try that again?');
		}
	});
}

/* When reporting is complete, disable the button */
function reportComplete()
{
	$('#foffbox-player-report').html('<span class="glyphicon glyphicon-ok foffbox-player-button-active"></span>');
}

/* E-mails a song (or rather, a not-song) ID to moi so I can check it and get rid of it if necessary */
function reportSongId(reportId)
{
	reported = true;
	$('#foffbox-player-report').html('<img src="img/loading-square.gif"/>');
	$('#foffbox-player-report').attr('disabled', true);
	$('#foffbox-player-report').tooltip('hide');

	//Report it!
	$.ajax({
		type: 'POST',
		url: 'report-song.php',
		dataType: 'json',
		data:
		{
			reportId:reportId
		},
		success: function(data){ reportComplete(); },
		error: function(err){ reportComplete(); }
	});

	document.location.hash = currentId;
}

/*
 * Submits a comment to be added to the comment thread 
 * for the songId the user is currently viewing.
 */
function dropComment()
{
	$('#comment-error').hide();

	var messageText = $('#comment-field').val();
	messageText = messageText.trim();
	messageText = messageText.replace(/(?:\r\n|\r|\n)/g, '<br>'); //Replace line breaks with <br> tags
	
	if (messageText.length > 0 && messageText.length < 250)
	{
		$.ajax({
			type: 'POST',
			url: 'drop-comment.php',
			dataType: 'json',
			data:
			{
				requestId:currentId,
				message:messageText
			},
			success: function(data)
			{
				//If successful, re-render the comment thread
				if (data['success'])
				{
					$('#comment-field').val('');
					renderComments(data['comments']);
				}
				else
				{
					$('#comment-error').html(data['message']);
					$('#comment-error').show();
				}
			},
			error: function(err)
			{
				$('#comment-error').html("Something went wrong. Please try again later.");
				$('#comment-error').show();
			}
		});
	}
	else if (messageText.length <= 0)
	{
		$('#comment-error').show();
		$('#comment-error').html("Pipe up, quiet. You can enter a bit more than that.");
	}
	else if (messageText.length > 250)
	{
		$('#comment-error').show();
		$('#comment-error').html("Hold it there, tiger. That message is way too long.");
	}
	
	document.location.hash = currentId;
}

/* When the "First" button is clicked, go back to the first song */
$(document).on('click', '#foffbox-player-first', function(event) {
	requestNewSong(0);
});

/* When the "Previous" button is clicked, go back 1 song (numerically, don't save position for now) */
$(document).on('click', '#foffbox-player-prev', function(event) {
	requestNewSong(previousId);
});

/* When the "Autoplay" button is clicked, toggle the Autoplay functionality */
$(document).on('click', '#foffbox-player-autoplay', function(event){
	autoplay = !autoplay;
	$('#foffbox-player-autoplay').toggleClass('foffbox-player-button-active');
});

/* When the "Shuffle" button is clicked, toggle the Shuffle functionality */
$(document).on('click', '#foffbox-player-shuffle', function(event){
	shuffle = !shuffle;
	$('#foffbox-player-shuffle').toggleClass('foffbox-player-button-active');
});

/* Report button -- only once per song */
$(document).on('click', '#foffbox-player-report', function(event){
	if (!reported)
	{
		reportSongId(currentId);
	}
});

/* When the "Next" button is clicked, go forward 1 song */
$(document).on('click', '#foffbox-player-next', function(event) {
	shuffle ? requestNewSong(-1) : requestNewSong(currentId+1);
});

/* When the "Last" button is clicked, request the song with the highest ID */
$(document).on('click', '#foffbox-player-last', function(event) {
	requestNewSong(maxId);
});

/* Open/close the comments view */
$(document).on('click', '#foffbox-player-comments', function(event){
	if (commentAreaOpen)
	{
		commentAreaOpen = false;
		$('#foffbox-player-right').animate({left: '100%'}, 500);
	}
	else
	{
		commentAreaOpen = true;
		$('#foffbox-player-right').animate({left: '75%'}, 500);
	}
});

/* When the user clicks the "submit comment" button, drop a comment */
$(document).on('click', '#submit-comment', function(event){
	dropComment();
});

/* Update tooltip as request slider is moved */
$(document).on('input', '#request-slider', function(event){
	var sliderValue = $(this).val();
	var tooltipText = 'Jump to Beat #' + sliderValue;
	$('#request-slider').attr('title', tooltipText);
	$('#request-slider').tooltip('fixTitle').tooltip('show');
});

/* Play/pause the video on button click */
$(document).on('click', '#foffbox-player-play-pause, #foffbox-player-video-cover', function(event){
	playerStopped ? player.playVideo() : player.pauseVideo();
});

/* Stop events from bubbling up to the parent -- we don't want clicks on the comments section causing the video to play */
$(document).on('click', '#foffbox-player-right', function(event){
	event.stopPropagation();
	event.preventDefault();
});

/* Request beat based on value of slider */
$(document).on('mouseup', '#request-slider', function(event){
	$('#request-slider').attr('disabled', true);
	
	var sliderValue = $(this).val();
	requestNewSong(sliderValue);
});

/* Set volume based on value of other slider */
$(document).on('mousemove', '#volume-slider', function(event){
	volume = $(this).val();
	$(this).attr('value', volume);
	player.setVolume(volume);
	volumePopoverContent = $(this).closest('.popover-content').html();
});

/* Document ready */
$(document).on('ready', function(){
	initialize();
	initializePopover();
	
	//Initialize the Youtube API Script
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	//Initialize tooltips for the controls @ the bottom of the screen
	$('.foffbox-player-button').tooltip({
		container: 'body',
		placement: 'top'
	});
	$('#request-slider').tooltip({
		animation: false,
		container: 'body',
		placement: 'top'
	});
	
	$('#foffbox-player-quality').on('hidden.bs.popover', function() {
		if (!commentAreaOpen)
		{
			$('#foffbox-toolbar').trigger('mouseout');
		}
	});
	
	/* Fade toolbar in/out when mousing over/mousing out of it */
	$('#foffbox-toolbar').on('mouseout', function(event){
		if ($('.popover-content').length <= 0 && !commentAreaOpen)
		{
			$(this).stop();
			$(this).fadeTo(3000, 0.20);
		}
	});

	$('#foffbox-toolbar').on('mouseover', function(event){
		$(this).stop();
		$(this).fadeTo(500, 1.0);
	});
});