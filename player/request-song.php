<?php

$requestId = intval($_POST['requestId']);

//Grab the total number of videos
$configMode = 'live';
$connectionData = require_once("../server-config.php");
$connectionData = $connectionData[$configMode];
$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);

//Get highest ID in DB (so we know what our rand range is)
$sqlStatement = $pdo->prepare("SELECT MAX(`id`) as id FROM `submissions_archive`");
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (empty($results))
{
	echo(json_encode(array('success' => false, 'message' => "Bummer. No videos were found.")));
	return;
}

$result = $results[0];
$maxId = $result['id'];

//If the requested ID is less then 0, give them a random one.
if ($requestId < 0)
{
	$requestId = rand(1, $maxId);
}

//If the requested ID is greater than the max ID (i.e. they're trying to advance past the end), reset them to the beginning.
//Note that in the case that the ID is == 0, it's ok -- see the query below.
else if ($requestId > $maxId)
{
	$requestId = 1;
}

//Now choose a video based on the input request ID. We account for invalid/nonexistent IDs here.
$sqlStatement = $pdo->prepare("
	SELECT `id`, `youtubeUrl`, `message`, `views`, `dateSubmitted`
	FROM `submissions_archive`
	WHERE `id` >= :requestId
	ORDER BY `id` ASC
	LIMIT 1;
");
$sqlStatement->bindValue(':requestId', $requestId, PDO::PARAM_INT);
$sqlStatement->execute();
$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (empty($results))
{
	echo(json_encode(array('success' => false, 'message' => "Bummer. No videos were found.")));
	return;
}

$result = $results[0];

$views = intval($result['views']);
$views++;

$sqlStatement = $pdo->prepare("
	UPDATE `submissions_archive`
	SET `views` = :views
	WHERE `id` = :id;
");
$sqlStatement->bindValue(':views', $views);
$sqlStatement->bindValue(':id', $result['id']);
$sqlStatement->execute();

$retrievedId = $result['id'];

//Get next lowest ID
$sqlStatement = $pdo->prepare("
	SELECT MAX(`id`) as nextId
	FROM `submissions_archive`
	WHERE `id` < :retrievedId
	ORDER BY `id` ASC
	LIMIT 1;
");
$sqlStatement->bindValue(':retrievedId', $result['id'], PDO::PARAM_INT);
$sqlStatement->execute();
$resultNextLowest = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

if (empty($resultNextLowest))
{
	echo(json_encode(array('success' => false, 'message' => "Bummer. No videos were found.")));
	return;
}


$resultNextLowest = $resultNextLowest[0]['nextId'];
if (empty($resultNextLowest))
{
	$resultNextLowest = $maxId;
}

//Get the most recent 20 comments for the song
$sqlStatement = $pdo->prepare("
	SELECT `message`, `dateSubmitted`
	FROM `archive_comments`
	WHERE `submissionArchiveId` = :requestId
	ORDER BY `dateSubmitted` DESC
	LIMIT 20;	
");
$sqlStatement->bindValue(':requestId', $retrievedId, PDO::PARAM_INT); //Need the retrieved ID, NOT the initial request ID -- to account for missing videos
$sqlStatement->execute();
$commentResults = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);

$comments = array();
if (!empty($commentResults))
{
	foreach ($commentResults as $commentResult)
	{
		$comments[] = array(
			'dateSubmitted' => date('F jS, Y @ g:i A', strtotime($commentResult['dateSubmitted'])),
			'message' 		=> $commentResult['message']
		);
	}
}

echo(json_encode(
	array(
		'comments'			=> $comments,
		'maxId'				=> intval($maxId),
		'previousId'		=> intval($resultNextLowest),
		'submissionDate' 	=> date('F jS, Y @ g:i A', strtotime($result['dateSubmitted'])),
		'submissionId' 		=> intval($result['id']),
		'submissionMessage' => $result['message'],
		'submissionUrl'		=> $result['youtubeUrl'],
		'success' 			=> true,
		'views'				=> $views
	)
));
return;