<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 21/05/16
 */
?>
<head>

	
	<!-- start: Meta -->
	<meta charset="utf-8">
	<title>!CHAOS Dashboard</title>
	
	<!-- start: Mobile Specific -->
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<!-- end: Mobile Specific -->
	
	<!-- start: CSS -->
	<!--link id="bootstrap-style" href="/chaos_dashboard/css/bootstrap.min.css" rel="stylesheet">
	<link href="/chaos_dashboard/css/bootstrap-responsive.min.css" rel="stylesheet"-->
		
		<?php
			global $main_dir;
			$main_dir="chaos_dashboard";
			
			global $index;
			$index = "index.php";
			

			
			//link style
			echo '<link id="bootstrap-style" href="/' .$main_dir. '/css/bootstrap.min.css" rel="stylesheet">';
			echo '<link href="/' .$main_dir. '/css/bootstrap-responsive.min.css" rel="stylesheet">';
			echo '<link id="base-style" href="/' .$main_dir. '/css/style.css" rel="stylesheet">';
			echo '<link id="base-style-responsive" href="/' .$main_dir. '/css/style-responsive.css" rel="stylesheet">';
			echo '<link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet">';
			echo '<link href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext" rel="stylesheet" type="text/css">';
			echo '<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>';
			//echo '<link id="ie-style" href="/' .$main_dir. '/css/ie.css" rel="stylesheet">';
			echo '<link id="ie9style" href="/' .$main_dir. '/css/ie9.css" rel="stylesheet">';
			
			echo '<link href="/' .$main_dir. '/css/custom_style.css" rel="stylesheet">';
			
			//link script
			echo '<script src="/'.$main_dir.'/js/jquery-1.9.1.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery-migrate-1.0.0.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery-ui-1.10.0.custom.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery.ui.touch-punch.js"></script>';
			echo '<script src="/'.$main_dir.'/js/modernizr.js"></script>';
			echo '<script src="/'.$main_dir.'/js/bootstrap.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery.cookie.js"></script>';
			echo '<script src="/'.$main_dir.'/js/fullcalendar.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery.dataTables.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/excanvas.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jquery.chosen.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.uniform.min.js"></script>';		
			echo '<script src="/'.$main_dir.'/js/jquery.cleditor.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.noty.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.elfinder.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.raty.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.iphone.toggle.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.uploadify-3.1.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.gritter.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.imagesloaded.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.masonry.min.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.knob.modified.js"></script>';	
			echo '<script src="/'.$main_dir.'/js/jquery.sparkline.min.js"></script>';
			echo '<script src="/'.$main_dir.'/js/counter.js"></script>';
			echo '<script src="/'.$main_dir.'/js/retina.js"></script>';
			echo '<script src="/'.$main_dir.'/js/custom.js"></script>';		
			//echo '<script src="/'.$main_dir.'/js/monitoring2.js"></script>';		
			//echo '<script src="/'.$main_dir.'/js/monitoring-alarm.js"></script>';
			echo '<script src="/'.$main_dir.'/js/jchaos.js"></script>';		


		?>

	<!--link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet"-->

	<!--link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext' rel='stylesheet' type='text/css'-->
	<!-- The HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  	<!--script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script-->
	<![endif]-->
		
	<!-- start: Favicon -->
	<link rel="shortcut icon" href="img/favicon.ico">
	<!-- end: Favicon -->
	
	
	<!--script>
		var url_server =  location.host; //"chaosdev-webui1.chaos.lnf.infn.it";
		var n_port = "8081";
	</script-->	
	

	<!-- start: JavaScript-->

		<!--script src="/chaos_dashboard/js/jquery-1.9.1.min.js"></script>
		
	<script src="/chaos_dashboard/js/jquery-migrate-1.0.0.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery-ui-1.10.0.custom.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.ui.touch-punch.js"></script>
	
		<script src="/chaos_dashboard/js/modernizr.js"></script>
	
		<script src="/chaos_dashboard/js/bootstrap.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.cookie.js"></script>
	
		<script src='/chaos_dashboard/js/fullcalendar.min.js'></script>
	
		<script src='/chaos_dashboard/js/jquery.dataTables.min.js'></script>

		<script src="/chaos_dashboard/js/excanvas.js"></script-->
	<!--script src="/chaos_dashboard/js/jquery.flot.js"></script>
	<script src="/chaos_dashboard/js/jquery.flot.pie.js"></script>
	<script src="/chaos_dashboard/js/jquery.flot.stack.js"></script>
	<script src="/chaos_dashboard/js/jquery.flot.resize.min.js"></script-->
	
		<!--script src="/chaos_dashboard/js/jquery.chosen.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.uniform.min.js"></script>
		
		<script src="/chaos_dashboard/js/jquery.cleditor.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.noty.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.elfinder.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.raty.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.iphone.toggle.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.uploadify-3.1.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.gritter.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.imagesloaded.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.masonry.min.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.knob.modified.js"></script>
	
		<script src="/chaos_dashboard/js/jquery.sparkline.min.js"></script-->

	
		<!--script src="/chaos_dashboard/js/counter.js"></script>
	
		<script src="/chaos_dashboard/js/retina.js"></script>

		<script src="/chaos_dashboard/js/custom.js"></script>
		
		<script src="/chaos_dashboard/js/monitoring2.js"></script>
		
		<script src="/chaos_dashboard/js/monitoring-alarm.js"></script-->
		
		<!--link href="https://cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js">
<link href="https://cdn.datatables.net/1.10.13/js/dataTables.bootstrap.min.js"-->


		<!--script src="/chaos_dashboard/js/archive.js"></script-->
		<!--script src="/chaos_dashboard/js/plot-archive.js"></script-->
		
		<!--script src="../webChaos/jchaos.js"></script-->


        <script>
                jchaos.setOptions({"uri":location.host});
		var url_server =  location.host; //"chaosdev-webui1.chaos.lnf.infn.it";
		var n_port = "8081";

	
	</script>	
	



</head>
	<!-- end: JavaScript-->
	
