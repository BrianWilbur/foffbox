<?php

$requestId = intval($_POST['requestId']);
$message = $_POST['message'];

//Grab the total number of videos
$configMode = 'live';
$connectionData = require_once("../server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

//Strip all tags except <br>s from message
$message = strip_tags(trim($message), "<br>");
$message = str_replace("\"", "&quot;", $message);

if (strlen($message) <= 0)
{
	echo(json_encode(array('success' => false, 'message' => "You gotta enter a message to comment.")));
}
else if (strlen($message) > 250)
{
	echo(json_encode(array('success' => false, 'message' => "Shorten that message down a bit.")));
}

//IP Addresses might need to be found in a different area due to a proxy
$ipAddress = $_SERVER['REMOTE_ADDR'];
while (strlen($ipAddress) < 9)
{
	//Client IP
	if (!empty($_SERVER['HTTP_CLIENT_IP']))
	{
		$ipAddress = $_SERVER['HTTP_CLIENT_IP'];
	}

	//Forward IP (proxies)
	if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
	{
		$ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
	}

	break;
}

$sqlStatement = $pdo->prepare("
	INSERT INTO `archive_comments`
		(`submissionArchiveId`, `message`, `ipAddress`)
	VALUES
		(:requestId, :message, :ipAddress);
");
$sqlStatement->bindValue(':requestId', $requestId, PDO::PARAM_INT);
$sqlStatement->bindValue(':message', $message);
$sqlStatement->bindValue(':ipAddress', $ipAddress); 

try
{
	$sqlStatement->execute();
}
catch (PDOException $e)
{
	echo(json_encode(array('success' => false, 'message' => "Something went wrong. Try again in a bit.")));
}

//Refresh comment display
//Get the most recent 10 comments for the song
$sqlStatement = $pdo->prepare("
	SELECT `message`, `dateSubmitted`
	FROM `archive_comments`
	WHERE `submissionArchiveId` = :requestId
	ORDER BY `dateSubmitted` DESC
	LIMIT 10;	
");
$sqlStatement->bindValue(':requestId', $requestId, PDO::PARAM_INT);
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

$comments = array();
if (!empty($results))
{
	foreach ($results as $result)
	{
		$comments[] = array(
			'dateSubmitted' => date('F jS, Y @ g:i A', strtotime($result['dateSubmitted'])),
			'message' 		=> $result['message']
		);
	}
}

echo(json_encode(array(
	'comments' => $comments,
	'message' => "Something went wrong. Try again in a bit.",
	'success' => true
)));