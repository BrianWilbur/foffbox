<?php

$labelId = intval($_POST['labelId']);
$songId = intval($_POST['songId']);
if (empty($labelId) || empty($songId))
{
	return;
}

//Initialize PDO with data from config
$configMode = 'live';
$connectionData = require_once("../server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

//Get IP Address
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

//Submit it
$sqlStatement = $pdo->prepare("
	INSERT INTO `submissions_archiveLabels`
		(`submissionsArchiveId`, `submissionsLabelId`, `ipAddress`)
	VALUES
		(:songId, :labelId, :ipAddress)
	ON DUPLICATE KEY UPDATE
		`submissionsLabelId` = :labelId;
");
$sqlStatement->bindValue(':songId', $songId);
$sqlStatement->bindValue(':labelId', $labelId);
$sqlStatement->bindValue(':ipAddress', $ipAddress);
$sqlStatement->execute();

return;