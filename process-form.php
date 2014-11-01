<?php

/*
 * Validates the input form data and returns an array ready to be shipped back to the view.
 * Expects 'youtubeUrl', 'message', 'signUp' and 'emailAddress' as POST data.
 */
function validateData()
{
	//Prep slogan
	$filename = "data/txt/success-messages.txt";
	$slogans = file($filename);
	$numLines = count($slogans);
	$lineNumber = rand(1, $numLines);
	$slogan = $slogans[$lineNumber];

	//Grab POST data
	$youtubeUrl = trim($_POST['youtubeUrl']);
	$message = strip_tags(trim($_POST['message']), "<br>");
	$message = str_replace("\"", "&quot;", $message);
	$signUp = $_POST['signUp'];
	$labelId = $_POST['labelId'];
	
	$emailAddress = '';
	if (!empty($_POST['emailAddress']))
	{
		$emailAddress = trim($_POST['emailAddress']);
	}
	
	if (empty($youtubeUrl))
	{
		echo (json_encode(array('success' => false, 'message' => "You can't just not enter a Youtube URL! That's not how this works!")));
		return;
	}
	else if (empty($message))
	{
		echo (json_encode(array('success' => false, 'message' => "Don't just stay silent! Enter something in that message box.")));
		return;
	}

	//Validate Youtube URL
	$youtubeRegMatch = preg_match("/\b((https:\/\/)|(http:\/\/))?((m.)|(www.))?(youtube.com\/watch\?v=)([a-zA-Z0-9\-\_]){9,12}\b/", $youtubeUrl);
	if (empty($youtubeRegMatch))
	{
		echo(json_encode(array('success' => false, 'message' => "That's no Youtube URL! Try something more like this:<br><span class='txt-fixed'>https://www.youtube.com/watch?v=ZZ5LpwO-An4</span>")));
		return;
	}
	
	$ampersandPos = strpos($youtubeUrl, "&");
	if ($ampersandPos !== false)
	{
		$strippedUrl = substr($youtubeUrl, 0, $ampersandPos);
	}
	else
	{
		$strippedUrl = $youtubeUrl;
	}

	//Validate message
	if (strlen($message) < 5)
	{
		echo(json_encode(array('success' => false, 'message' => "Try entering something a little more legit for your message. How about at least 5 letters?")));
		return;
	}
	else if (strlen($message) > 500)
	{
		echo(json_encode(array('success' => false, 'message' => "Woah! Settle down there Rambo! That message is way too long.")));
		return;
	}
	
	//Validate email regardless
	if (!empty($emailAddress))
	{
		$emailValidation = filter_var($emailAddress, FILTER_VALIDATE_EMAIL);
		if (empty($emailValidation))
		{
			echo(json_encode(array('success' => false, 'message' => "E-mail address failed to validate.")));
			return;
		}
	}
	
	//Commit Youtube URL & Message to one DB table
	$configMode = 'live';
	$connectionData = require_once("server-config.php");
	$connectionData = $connectionData[$configMode];
	
	$pdo = new PDO($connectionData['dsn'], $connectionData['username'], $connectionData['password']);
	$sqlStatement = $pdo->prepare(
		"INSERT INTO `submissions`
			(`youtubeUrl`, `message`)
		VALUES
			(:youtubeUrl, :message);"
	);
	$sqlStatement->bindValue(":youtubeUrl", $strippedUrl);
	$sqlStatement->bindValue(":message", $message);
	
	try
	{
		$sqlStatement->execute();
	}
	catch (PDOException $error)
	{
		echo(json_encode(array('success' => false, 'message' => "Something went wrong -- Sorry about that. Try again later.")));
		return;
	}
	
	//The Youtube URL already existed
	if ($sqlStatement->rowCount() == 0)
	{
		echo(json_encode(array('success' => false, 'message' => "Great minds think alike: That URL has already been submitted. Try another.")));
		return;
	}
		
	//Collect IP Address for reporting purposes (if needed)
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
		
	//Now insert the video into the archive as well (we'll just make this process automatic for now)
	$sqlStatement = $pdo->prepare(
		"INSERT INTO `submissions_archive`
			(`youtubeUrl`, `message`, `ipAddress`)
		VALUES
			(:youtubeUrl, :message, :ipAddress);"
	);
	$sqlStatement->bindValue(":youtubeUrl", $strippedUrl);
	$sqlStatement->bindValue(":message", $message);
	$sqlStatement->bindValue(":ipAddress", $ipAddress);
	try { $sqlStatement->execute(); }
	catch (\Exception $error)
	{
		echo(json_encode(array('success' => false, 'message' => "Something went wrong, and we're not quite sure what. Please try again later.")));
		return;
	}
	
	$lastInsertId = $pdo->lastInsertId();
	
	if (!empty($labelId))
	{
		//Insert the label (if any) into the archiveLabels directory alon with the user's IP Address
		$sqlStatement = $pdo->prepare("
			INSERT INTO `submissions_archiveLabels`
				(`submissionsArchiveId`, `submissionsLabelId`, `ipAddress`)
			VALUES
				(:songId, :labelId, :ipAddress)
			ON DUPLICATE KEY UPDATE
				`submissionsLabelId` = :labelId;
		");
		$sqlStatement->bindValue(':songId', $lastInsertId);
		$sqlStatement->bindValue(':labelId', $labelId);
		$sqlStatement->bindValue(':ipAddress', $ipAddress);
		try { $sqlStatement->execute(); }
		catch (\Exception $e)
		{
			//We don't care if this happens, they can just label it later
		}
	}
	
	//Commit e-mail address to the "I want a digest" DB if necessary
	if ($signUp == "true" && !empty($signUp) && !empty($emailAddress))
	{
		$sqlStatement = $pdo->prepare(
			"INSERT IGNORE INTO `digest_emails`
				(`email`)
			VALUES
				(:email)"
		);
		$sqlStatement->bindValue(":email", $emailAddress);
		
		try
		{
			$sqlStatement->execute();
			$headers = "From: Foffbox <noreply@foffytrack.com>" . "\r\n";
			$headers .= "MIME-Version: 1.0" . "\r\n";
			$headers .= "Content-Type: text/html; charset=ISO-8859-1" . "\r\n";
			mail('brianmattwilbur@gmail.com', "New signup!", "$emailAddress has subscribed to the Foffbox.", $headers);
		}
		catch (\Exception $e)
		{
			echo(json_encode(array('success' => false, 'message' => "Something went wrong -- We got your URL, but couldn't manage to sign you up. Try again later.")));
			return;
		}
	}
	
	//Get highest ID in DB (only used when called from Radio)
	$sqlStatement = $pdo->prepare("SELECT MAX(`id`) as id FROM `submissions_archive`");
	
	//Even if this fails, we're still good -- the user doesn't care about this.
	try
	{
		$sqlStatement->execute();
	}
	catch (\Exception $e)
	{
		echo(json_encode(array(
			'message' => $slogan,
			'success' => true
		)));
	}
	
	$results = $sqlStatement->fetchAll(PDO::FETCH_ASSOC);
	$result = $results[0];
	$maxId = $result['id'];

	echo(json_encode(array(
		'maxId' => $maxId,
		'message' => $slogan,
		'success' => true
	)));
	return;
}

validateData();