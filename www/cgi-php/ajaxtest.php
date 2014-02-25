<?php
	$json = get_magic_quotes_gpc() ? stripslashes($_REQUEST["data"]) : $_REQUEST["data"];
	$data = json_encode($json);
	echo $data;
?>