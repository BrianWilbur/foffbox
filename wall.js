var pageSize = 2;
var failureCount = 0;
var opacityBright = 1.0;
var opacityFade = 0.15;
var curYPos = 0;
vidCount = 0;

$(document).mousemove(function(event) {
	curYPos = event.pageY;
});

function getVideos(lastId)
{
	//Ping DB and ask for 10 videos
	$.ajax({
		type: 'POST',
		url: 'get-videos.php',
		dataType: 'json',
		data:
		{
			lastId:lastId,
			pageSize:pageSize
		},
		success: function(data)
		{
			//If you get data, append the new videos
			if (data['success'])
			{
				var numVideos = data['videos'].length;
				
				if (numVideos > 0)
				{
					$('#nothing-here').remove();
				}
				
				$.each(data['videos'], function(index, value){
					
					if (value['id'] > lastId)
					{
						lastId = value['id'];
					}
				})
				
				//Create new rows where necessary
				if (vidCount >= 5)
				{
					$('#wall').append("</div>");
					vidCount = 0;
				}
				if (vidCount == 0)
				{
					$('#wall').append("<div class='row' style='padding:0; margin:0'>");
				}
				
				appendVideos(data['videos']);
				
				//Keep grabbing videos if we grabbed the maximum number for this page size
				if (numVideos == pageSize)
				{
					getVideos(lastId);
				}
				else if (numVideos < pageSize)
				{
					$('#loading').hide();
				}
			}
			
			//If you fail once, try again. If you fail five times, forget it.
			else
			{
				failureCount++;
				
				if (failureCount < 5)
				{
					getVideos(lastId);
				}
				else
				{
					$('#loading').html('Something went wrong. Wait a few minutes and try refreshing.');
				}
			}
			
			$("[data-toggle='tooltip']").tooltip({
				//'placement': 'bottom'
				'placement': function(context, source){
					var bottom = $(document).height();
					
					if (curYPos > bottom - 300) { return 'top'; }
					else { return 'bottom'; }
				},
				trigger: 'hover',
			});
		},
		//If you fail once, try again. If you fail five times, forget it.
		error: function(err)
		{
			failureCount++;
			if (failureCount < 5)
			{
				getVideos();
			}
			else
			{
				$('#loading').html('Something went wrong. Wait a few minutes and try refreshing.');
			}
		}
	});
}

//Appends the given array of URLs to the page.
function appendVideos(newUrls)
{
	$.each(newUrls, function(index, value){
		var url = value['youtubeUrl'];
		var newUrl = url.replace("watch?v=", "embed/");
		newUrl += "?";
		newUrl += "wmode=opaque&controls=2&autohide=1&modestbranding=1&iv_load_policy=3&fs=0&loop=0";
		
		var message = value['message'];
		message = message.replace(/<br>/g, "\r\n");
		
		//Append to the row -- not straight to the wall
		$('#wall').children('.row').last().append('<div class="col-md-2" style="margin:0 !important; padding:0 !important;"><div class="youtube-frame-overlay"><iframe onclick="helloWorld()" class="youtube-frame" type="text/html" opacityLocked="false" style="opacity:' + opacityFade + '; width:100% !important;" src="' + newUrl + '" frameborder="0" data-toggle="tooltip" title="' + message + '"></iframe></div></div>');
		$('.youtube-frame').last().height($('.youtube-frame').last().width() * 0.75);
		vidCount++;
	});
}

$(document).ready(function(){
	getVideos(0);
	
	$(document).on('mouseover', '.youtube-frame-overlay', function(event){
		$(this).children('iframe').css('opacity', opacityBright);
	});
	
	$(document).on('mouseout', '.youtube-frame-overlay', function(event){
	
		if ($(this).children('iframe').attr('opacityLocked') != false)
		{
			$(this).children('iframe').css('opacity', opacityFade);
		}
	});
});