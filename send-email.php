<?php
set_time_limit(0);

$date = date('l, F jS, Y');
$configMode = 'live';
$connectionData = require_once("server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

$sqlStatement = $pdo->prepare("SELECT `message` FROM `email_messages` ORDER BY `id` DESC LIMIT 1");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

$message = $results[0]['message'];

$emailMessage = "
	<html>
		<body style='background-color:#111; color:#CCC; font-family: \"Arial Black\", Gadget, sans-serif; width:35%;'>
			<h1 style='font-weight:normal; margin-bottom:5px; text-align:center;'>The Foffbox Music Digest</h1>
			<h3 style='font-weight:normal; margin-top:5px; margin-bottom:5px; text-align:center;'>Week of $date</h3><br>
			
			<hr/><br>
			
			<h4 style='font-weight:normal; margin-top:5px; margin-bottom:5px; text-align:center;'>$message <a href='http://www.foffytrack.com/foffbox' style='color:#86DEC5;'>Click to visit the Foffbox</a>.<br><br>
			
			Also, don't forget to check out the <a href='http://foffytrack.com/foffbox/player/player.phtml' style='color:#86DEC5;'>Foffbox Playlist</a>, where you can listen to any beat at any time.
			
		</body>
	</html>
";

echo($emailMessage);
$emailMessage = wordwrap($emailMessage);

$to = "brianmattwilbur@gmail.com";
$subject = "Foffbox Digest - Week of $date";
$headers = "From: Foffbox <noreply@foffytrack.com>" . "\r\n";
$headers .= "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-Type: text/html; charset=ISO-8859-1" . "\r\n";

//Figure out who to send it to!
$sqlStatement = $pdo->prepare("SELECT `email` FROM `digest_emails`");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (!empty($results))
{
	foreach ($results as $result)
	{
		$to = $result['email'];
		
		if (empty($to)) continue;
		
		sleep(10);
		$sentMail = mail($to, $subject, $emailMessage, $headers);
	}
}

//Wipe old submissions (bye bye forever...)
$sqlStatement = $pdo->prepare("DELETE FROM `submissions_previous`");
$sqlStatement->execute();

//Move new submissions onto the wall
$sqlStatement = $pdo->prepare("INSERT INTO `submissions_previous` SELECT * FROM `submissions`;");
$sqlStatement->execute();

//Clear out current submissions to make way for new ones
$sqlStatement = $pdo->prepare("DELETE FROM `submissions`");
$sqlStatement->execute();