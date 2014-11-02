<?php

//Grab the total number of videos
$configMode = 'live';
$connectionData = require_once("../server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

$sqlStatement = $pdo->prepare("SELECT `id`, `name` FROM `submissions_labels` WHERE `active` = 1");
$sqlStatement->execute();
$labelResults = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

echo(json_encode(array(
	'labels' => $labelResults
)));
return;
