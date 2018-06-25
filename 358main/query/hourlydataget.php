<?php
	function OpenCon() {
		$dbhost = "VRTVD25167";
		$dbuser = "piwik.user.stg";
		$dbpass = "Pa55w0rdUSERSTG";
		$db = "piwikdbstg";
		$conn = new mysqli($dbhost, $dbuser, $dbpass,$db) or die("Connect failed: %s\n". $conn -> error);		 
		return $conn;
	}
	 
	function CloseCon($conn) {
		$conn -> close();
	}

	$conn = OpenCon();

	if (!$conn) {
	    die("Connection failed: " . mysqli_connect_error());
	} else {}

	$getHourTimePageType = array();
	
    $sql = "SELECT ff.snapdate, ff.hourtime, sum(ff.hits) AS hits, ff.appid, ff.appname,
           ff.type, ff.pagename, ff.totaluniquevisitor, min(ff.min) AS `min`, max(ff.max) AS `max`,
	       ff.percentile90th, avg(ff.avg) AS `avg` FROM ( SELECT `Snap Date` AS `snapdate`, 
		   `HourTime` AS `hourtime`, sum(`Hits`) AS `hits`, `App ID` AS `appid`, `App Name` as `appname`, 
		   `PageName` AS `pagename`, sum(`Unique Visitor`) AS `totaluniquevisitor`, 
		   min(`Generation Time`) AS `min`, max(`Generation Time`) AS `max`, 
		   round(avg(`Generation Time`), 2) AS `avg`, SUBSTRING_INDEX( SUBSTRING_INDEX(
		   SUBSTRING( GROUP_CONCAT( IF(`Generation Time` IS NULL, '', `Generation Time`) 
		   ORDER BY `Generation Time` ASC SEPARATOR ','), SUM(IF(`Generation Time` IS NULL, 1, 0)) + 1),
		   ',', round(90/100 * COUNT(*))), ',', -1) AS `percentile90th`, ( CASE WHEN avg(`Percentage`) > 80 
		   THEN 'Mostly'  WHEN avg(`Percentage`) > 29 THEN 'Commonly' ELSE 'Rarely' END ) AS 'type' 
		   FROM appconso2 WHERE `start` >= addtime(date_sub(now(), interval 1440 minute), '0 4:00:00')
	       AND `end` <= addtime(date_sub(now(), interval 60 minute), '0 4:00:00') 
           GROUP BY `id1`) AS ff GROUP BY appid, hourtime, type ORDER BY ff.appid, ff.snapdate;";

	$rows = 0;
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
	   	while($row = $result->fetch_assoc()) {
			$getHourTimePageType[$rows] = $row;
			$rows = $rows + 1;
	   	}
	}
	
	$json = json_encode($getHourTimePageType);
	echo $json;
	CloseCon($conn);
?>