<?php
/*
 * Gets a set number of videos.
 * Expects 'pageSize' and 'lastId' as POST parameters.
 */
function getVideos()
{
	//Grab POST data
	$pageSize = intval($_POST['pageSize']);
	$lastId = intval($_POST['lastId']);

	//Grab the next <pageSize> videos, starting with <lastId>
	$configMode = 'live';
	$connectionData = require_once("../server-config.php");
	$connectionData = $connectionData[$configMode];
	
	$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);
	$sqlStatement = $pdo->prepare("
		SELECT
			`id`, `youtubeUrl`, `message`
		FROM
			`submissions_previous`
		WHERE
			`id` > :id
		LIMIT
			:pageSize;
	");
	$sqlStatement->bindValue(":id", $lastId);
	$sqlStatement->bindValue(":pageSize", intval($pageSize), PDO::PARAM_INT);
	
	try
	{
		$sqlStatement->execute();
	}
	catch (PDOException $error)
	{
		echo(json_encode(array('success' => false, 'message' => "Couldn't get videos.")));
		return;
	}
	
	$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);
	
	
	$resultsArray = array(
		'success' => true,
		'videos' => $results
	);
	$jsonArray = json_encode($resultsArray);
	echo($jsonArray);
	return;
}

getVideos();