<?
	$fileName = 'tmp/build.json';
	saveParameters($fileName, 'build');

	$fileName = 'tmp/graph.json';
	saveParameters($fileName, 'graph');
	
	function saveParameters($fileName, $dataName) {
		$json = get_magic_quotes_gpc() ? stripslashes($_POST[$dataName]) : $_POST[$dataName];
		$data = json_encode($json);
		file_put_contents($fileName, $data);
	}
?>