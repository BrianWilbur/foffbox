<?php

//Get suggestion and return it. Simple-easy!
try
{
	$filename = "suggestion-messages.txt";
	$slogans = file($filename);
	$numLines = count($slogans);
	$lineNumber = rand(1, $numLines) - 1;
	$suggestion = $slogans[$lineNumber];
}
catch (\Exception $e)
{
	$suggestion = "Ask again later.<br><br>(Something went wrong.)";
}

echo($suggestion);
return;