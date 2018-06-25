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

	$getTotalVisitPerCountry = array();
	
	$sql = "SELECT sum(`Hits`) AS `hits`, `Portfolio` AS `portfolio`, 
	       `Lead` AS `lead`, `App ID` AS `appid`, `MD` AS `md`, `Manager` AS `manager`, 
	       `App Name` AS `appname`, `Service Tier` AS `servicetier`, 
	       `PageName` AS `pagename`, `Country` AS `country`, 
	       `Country Code` AS `countrycode`, sum(`Unique Visitor`) AS `totaluniquevisitor`, 
	       min(`Generation Time`) AS `min`, max(`Generation Time`) AS `max`, 
	       round(avg(`Generation Time`), 2) AS `avg`, SUBSTRING_INDEX( SUBSTRING_INDEX( 
	       SUBSTRING( GROUP_CONCAT( IF(`Generation Time` IS NULL, '', `Generation Time`) 
		   ORDER BY `Generation Time` ASC SEPARATOR ','), SUM( IF(`Generation Time` IS NULL, 1, 0)) + 1), 
		   ',', round(90/100 * COUNT(*))), ',', -1) AS `percentile90th`, sum(`TotalPageVisit`) AS `totalPageVisit`, 
	       ( CASE WHEN avg(`Percentage`) > 80 THEN 'Mostly' WHEN avg(`Percentage`) > 29 THEN 'Commonly' 
		   ELSE 'Rarely' END ) AS 'type' FROM appconso1 WHERE `start` >= addtime(date_sub(now(), interval 60 minute), '0 4:00:00')
           AND `end` <= addtime(now(), '0 4:00:00') GROUP BY `App ID`, `Pagename`, `Country` ORDER BY totaluniquevisitor DESC, max;";

	$rows = 0;
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
	   	while($row = $result->fetch_assoc()) {
			$getTotalVisitPerCountry[$rows] = $row;
			$rows = $rows + 1;
	   	}
	}
	
	$json = json_encode($getTotalVisitPerCountry);
	echo $json;
	CloseCon($conn);
?>