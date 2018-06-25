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
	
	$getDailyPageType = array();
	$sql = "SELECT ff.snapdate, ff.day, sum(ff.hits) as hits, ff.appid, ff.appname, ff.type,
	       ff.pagename, ff.totaluniquevisitor, min(ff.min) AS `min`, max(ff.max) AS `max`, avg(ff.avg) AS `avg`,
	       ff.percentile90th FROM ( SELECT `Snap Date` as `snapdate`, 
	       day(`Start`) as `day`, sum(`Hits`) as `hits`, 
	       `App ID` as `appid`, `PageName` as `pagename`, `App Name` as `appname`,  
	       sum(`Unique Visitor`) as `totaluniquevisitor`, 
	       min(`Generation Time`) as `min`, max(`Generation Time`) as `max`, 
	       round(avg(`Generation Time`), 2) as `avg`, SUBSTRING_INDEX( SUBSTRING_INDEX(
		   SUBSTRING( GROUP_CONCAT( IF(`Generation Time` IS NULL, '', 
		   `Generation Time`) ORDER BY `Generation Time` ASC SEPARATOR ','), 
		   SUM(IF(`Generation Time` IS NULL, 1, 0)) + 1), ',', round(90/100 * 
		   COUNT(*))), ',', -1) AS `percentile90th`,
	       ( CASE WHEN avg(`Percentage`) > 80 THEN 'Mostly' 
	       WHEN avg(`Percentage`) > 29 THEN 'Commonly'
		   ELSE 'Rarely' END ) AS 'type' FROM appconso2 
           WHERE `Start` >= addtime(date_sub(now(), interval 7 day), '0 4:00:00')
           AND `End` <= addtime(date_sub(now(), interval 1 day), '0 4:00:00')
           GROUP BY `id1` ) AS ff GROUP BY appid, day, type;";

	$rows = 0;
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
	   	while($row = $result->fetch_assoc()) {
			$getDailyPageType[$rows] = $row;
			$rows = $rows + 1;
	   	}
	}
	
	$json = json_encode($getDailyPageType);
	echo $json;
	CloseCon($conn);
?>