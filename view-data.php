<?php
set_time_limit(0);
$whitelistIps = array("69.136.99.243");
/*if (!in_array($_SERVER['REMOTE_ADDR'], $whitelistIps))
{
	header("HTTP/1.1 403 Forbidden");
	echo("Don't be a jerk. This is an admin panel only.");
	exit;
}*/

$date = date('l, F jS, Y');
$configMode = 'live';
$connectionData = require_once("server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

$sqlStatement = $pdo->prepare("SELECT `id`, `youtubeUrl`, `message` FROM `submissions`");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

//Concatenate the message
$emailMessage = "
	<html>
		<body style='background-color:#111; color:#CCC; font-family: \"Arial Black\", Gadget, sans-serif; width:35%;'><br>";

foreach ($results as $result)
{
	$id = htmlspecialchars($result['id']);
	$url = htmlspecialchars($result['youtubeUrl']);
	$msg = $result['message'];
	
	$emailMessage .= "
		<p>
			<span><strong>#$id:</strong> <a href='$url' style='color:#9DE0AF;'>$url</a><br>
			<span style='color:#AAA'>$msg</span></p>";
}

if (empty($results))
{
	$emailMessage .= "<p>No submissions are currently in the DB.</p>";
}

$emailMessage .= "<br><hr/><br>";

//Add the email addresses
$sqlStatement = $pdo->prepare("SELECT `email` FROM `digest_emails`");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (!empty($results))
{
	foreach ($results as $result)
	{
		$email = $result['email'];
		$emailMessage .= "$email<br>";
	}
}

$emailMessage .= "<br><hr/><br>";


			

$emailMessage .="
		</body>
	</html>";

echo($emailMessage);