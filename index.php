<?php include("../basedir.php"); ?>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="http://ajax.aspnetcdn.com/ajax/jquery.validate/1.13.0/jquery.validate.min.js"></script>
<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
<script src="../js/google-analytics.js"></script>

<!--

What are you doing?
Get out of my source code, fool!
Go home. You are drunk.


                _,.---.---.---.--.._
            _.-' `--.`---.`---'-. _,`--.._
           /`--._ .'.     `.     `,`-.`-._\
          ||   \  `.`---.__`__..-`. ,'`-._/
     _  ,`\ `-._\   \    `.    `_.-`-._,``-.
  ,`   `-_ \/ `-.`--.\    _\_.-'\__.-`-.`-._`.
 (_.o> ,--. `._/'--.-`,--`  \_.-'       \`-._ \
  `---'    `._ `---._/__,----`           `-. `-\
            /_, ,  _..-'                    `-._\
            \_, \/ ._(
             \_, \/ ._\
              `._,\/ ._\
                `._// ./`-._
         LGB      `-._-_-_.-'


		         (\/)
    ___         o \/
  ."   ". /@) o
<|_______|/`
  UU   UU

-->

<html>
	<head>
		<!-- Bootstrap CDN -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
		<link rel="stylesheet" href="style.css">
		<link rel="stylesheet" href="../css/style-navbar.css">
		<title>The Foffbox Music Digest!</title>
	</head>
	<body style="background-color: #e3e3e3;">
	
		<?php include("../php/navbar.php"); ?>

		<video id="bg-video" muted autoplay loop>
			<source src="vid/video.mp4" type="video/mp4">
		</video>

		<div class="row" style="margin:0 !important;">
			<div class="col-md-10 col-md-offset-1">
	
				<div class="row">
					<div class="col-md-6 col-md-offset-3">
						<div class="jumbotron">
							<div class="row">
								<div class="col-md-12">
									<h1>The Foffbox</h1>
									<p id="slogan">Drop beats in. Get beats out.</p>
								</div>
							</div>
							
							<hr/><br>

							<!-- Form -->
							<form id="foffbox-form">
								<div id="foffbox-form-group" class="form-group">
									<div class="row">
										<div class="col-md-12">

											<!-- Youtube URL -->
											<label for="youtube-link">Drop beats to send to the world:</strong></label> <span id="suggestion" class="pull-right field-subtext" data-toggle="tooltip" title="Hello world!">Need a suggestion? <span class="glyphicon glyphicon-question-sign"></span></span>
											<input id="youtube-link" type="text" class="form-control" name="youtubeUrl" placeholder="e.g. youtube.com/watch?v=ZZ5LpwO-An4" maxlength="64" pattern="((https:\/\/)|(http:\/\/))?((m.)|(www.))?(youtube.com\/watch\?v=)([a-zA-Z0-9\-\_]){9,12}" required /><br>

											<!-- Message -->
											<label for="message">Include a message:</label> <span id="message-remaining" class="pull-right field-subtext">??? remaining</span>
											<textarea id="message" type="text" class="form-control" name="messageBox" placeholder="Your own special touch." maxlength="500" rows="3" required></textarea><br>
											
											<!-- Email address 
											<label for="email">Wanna hear when new beats drop? Enter your e-mail (Optional):</label>
											<input id="email" type="email" class="form-control" name="email" placeholder="e.g. foffythefoff@gmail.com" maxlength="64" required/><br> -->
											
											<!-- Loading alert -->
											<div id="alert-loading" class="alert alert-info alert-hide"><img src="img/loading.GIF"/> Dropping requested beat...hold on a second.</div>
											
											<!-- Success alert -->
											<div id="alert-success" class="alert alert-success alert-hide">
												<span id="success-message"></span> Soon we'll all get to hear those delicious tunes.<br><br>
												Feel free to get right on it and send us another.
											</div>
											
											<!-- Failure alert -->
											<div id="alert-failure" class="alert alert-danger alert-hide">Something went wrong, but we're not sure what. Try again later...we'll have it fixed by then. Promise.</div>

											<button id="drop-beat" type="submit" class="btn btn-primary btn-lg btn-block"><span class="glyphicon glyphicon-log-in"></span>&nbsp; Drop that beat!</button><br>
											<!-- <div style="text-align:center;">Done dropping? Use the buttons below to listen to some beats.</div><br>  --><hr/>
											<strong>Listen to beats others have dropped:</strong><br>
											<a class="btn btn-info" href="player/player.phtml"><span class="glyphicon glyphicon-headphones"></span>&nbsp; All beats</a> 
											<a class="btn btn-info" href="wall.phtml"><span class="glyphicon glyphicon-headphones"></span>&nbsp; Weekly beats</a>
										</div>
									</div>
								</div>
							</form>
						</div><br>
						
						<!-- Footer 
						<div id="footer" class="well-sm">
							By entering your e-mail address in the box above, you accept that your e-mail address will be stored, but ONLY to send you your weekly beats. We will NEVER give out or advertise your data. We promise. Seriously.
						</div><br> -->
						
						
					</div>
				</div>
			</div>
		</div>
	</body>
</html>

<!-- Start of StatCounter Code for Default Guide -->
<script type="text/javascript">
var sc_project=10056021; 
var sc_invisible=1; 
var sc_security="bcd18b1d"; 
var scJsHost = (("https:" == document.location.protocol) ?
"https://secure." : "http://www.");
document.write("<sc"+"ript type='text/javascript' src='" +
scJsHost+
"statcounter.com/counter/counter.js'></"+"script>");
</script>

<script src="script.js"></script>
<script src="../js/global.js"></script>

<script> $('#navbar-foffbox').addClass('active'); </script>