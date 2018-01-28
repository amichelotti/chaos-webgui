<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

?>
<body>

<?php
require_once('header.php');
?>

	<div class="container-fluid-full">
		<div class="row-fluid">
				
			<!-- start: Main Menu -->
			<div id="sidebar-left" class="span2">
				<div class="nav-collapse sidebar-nav">
					<ul class="nav nav-tabs nav-stacked main-menu">						
						<?php require_once('menu.php'); ?>

					</ul>
				</div>
				
			</div>
			<!-- end: Main Menu -->
			
			
			<!-- start: Content -->
			<div id="content" class="span10">
			
				<ul class="breadcrumb">
					<li>
						<i class="icon-home"></i>
						<a href="<?php echo $index; ?>"><?php echo $curr_page; ?></a> 
						<i class="icon-angle-right"></i>
					</li>
				</ul>
			
    	<div class="row-fluid">

		<div class="box span12">
    	<div class="box-content">
    	<h3 class="box-header">Configuration</h3>
		<div class="span11 box">
    	<label class="label span6">Save whole configuration </label>
		<button type="button" id="save-configuration" class="icon-save span4">Save To Disk</button>
		</div>
		<div class="span11 box">
		<!-- <label class="label span3" >Upload Configuration </label> -->
		<input type="file" id="upload-file" class="span3" />

    	<select id="upload_selection" class="span2" multiple>
    	<option value="all" selected="selected">ALL</option>
    	<option value="us">UnitServers</option>
    	<option value="agent">Agents</option>
		<option value="snapshot">Snapshots</option>
		<option value="graphs">Graphs</option>
    	<option value="groups">Groups</option>
		</select>
		</div>
		</div>
		</div>
		</div>


				
								
	
		</div><!--/fluid-row--> -->
	</div>
	

	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>

	  $("#menu-dashboard").generateMenuBox();
	  $("#save-configuration").on("click",function(){
		  $(this).saveFullConfig();
	  });
	  $('#upload-file').on('change', function() {
	var reader = new FileReader();
	reader.onload = function(e) {
				alert(e.target.result); // File contents here

	};
	reader.readAsText(this.files[0]);

});
</script>
	

</body>
</html>
