<?php

$reportId = intval($_POST['reportId']);

if (empty($reportId))
{
	echo(json_encode(array()));
	return;
}

//Grab the total number of videos
$configMode = 'live';
$connectionData = require_once("../server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

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

//Get highest ID in DB (so we know what our rand range is)
$sqlStatement = $pdo->prepare("
	INSERT IGNORE INTO `submissions_reported`
		(`submissionArchiveId`, `ipAddress`)
	VALUES
		(:reportId, :ipAddress)
");
$sqlStatement->bindValue(':reportId', $reportId, PDO::PARAM_INT);
$sqlStatement->bindValue(':ipAddress', $ipAddress);
$sqlStatement->execute();

echo(json_encode(array()));
return;