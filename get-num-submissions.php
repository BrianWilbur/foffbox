<?php

$configMode = 'live';
$connectionData = require_once("server-config.php");
$connectionData = $connectionData[$configMode];

$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);
$sqlStatement = $pdo->prepare("SELECT COUNT(*) as `count` FROM `submissions_archive`;");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (empty($results))
{
	echo(json_encode(array('success' => false)));
	return;
}

echo(json_encode(array(
	'numSubmissions' => $results[0]['count'], 'success' => true
)));
return;