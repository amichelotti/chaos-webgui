<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

			
//link script
echo '<script type="text/javascript" src="https://root.cern/js/latest/scripts/JSRootCore.js?2d"></script>';
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.terminal.min.js"></script>';
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
echo '<link href="' .$main_dir. '/js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';;

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
					<div id="terminal"> </div>
					<div class="box">
						<div>
							<label class="label" for="save-script">Save script</label>
							<button type="button" id="save-script" class="icon-save">Save To Disk</button>
						</div>
						
						<div>
						
							<label class="label" for="upload-script">Load script</label>
							<div class="file-path-wrapper">
            				<input class="file-path validate" type="file"  id="upload-script">
        					</div>
							<button type="button" id="load-script" class="icon-load">Upload</button>
						</div>
					</div>
			</div>
		</div><!--/fluid-row--> -->
	</div>
	
	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>

function newWindow(id, name,sizex,sizey) {
	var hostWidth = $(window).width();
    var hostHeight = $(window).height();
    if(sizex==null){
		sizex=hostWidth/4;
	}
	if(sizey==null){
    var hostHeight = $(window).height();
		sizey=hostWidth/4;
	}
	var instant = $('<div></div>').html('<div id="' + id + '"></div>').dialog({
      minWidth: sizex,
      minHeight: sizey,
      title: name,
      resizable: true,
      buttons: [
        {
          text: "close", click: function (e) {
            $(this).dialog('close');
          }
        }


      ],
      close: function (event, ui) {
      },
      open: function () {

      }
    });
  }

	  var dump_script="";
	  var script_name;
	  $("#menu-dashboard").generateMenuBox();
	  var methods=Object.getOwnPropertyNames(jchaos).filter(function(property) {
        return typeof jchaos[property] == 'function';
	});
	var methods_full=[];
	 methods.forEach(function(elem){
		methods_full.push("jchaos."+elem);
	 });
	
	  $('#terminal').terminal(function(command) {
        if (command !== '') {
            try {
				if(command == "help"){
					return;
				}
				var regxp=/^\s*console\.([a-z]{3,})\((.*)\)\s*;/;
				var match = regxp.exec(command);
 
				if(match!=null){
					
					var result = window.eval(match[2]);
					if (result !== undefined) {
						if(match[1]=="error"){
							this.error(new String(result));

						} else{
							this.echo(new String(result));
						} 
					}
				}
				
				var result = window.eval(command);
				dump_script+=command;

                if (result !== undefined) {
                    this.echo(new String(result));
                }
            } catch(e) {
                this.error(new String(e));
            }
        } else {
           this.echo('');
        }
    }, {
        greetings: 'JavaScript Chaos Interpreter',
        name: 'JChaos',
        height: 600,
		prompt: 'chaos-js> ',
		completion:methods_full
		/*completion: function( command, callback) {
		callback(['jchaos.search("cuname", "cu|us|agent", true|false, callback(listofnodes){});',
			 'jchaos.getChannel (["dev0,"dev1"...], channel_id (0=out,1=in,2=custome,3=system,4=health,5=devalarm,6=cualarm-1 all), callback(arrayofdatasets){})',
			 'jchaos.sendCUCmd(["dev0,"dev1"...], "command name", Object (parameters),handleFunc)',
			]);
    }*/
    });
	 //$("#upload_selection").multiSelect("select_all");
	jchaos.setOptions({"console_log":$('#terminal').terminal().echo,"console_err":$('#terminal').terminal().error});
	  $("#save-script").on("click",function(){
		var blob = new Blob([dump_script], {type: "text/plain;charset=utf-8"});
    	  saveAs(blob, "jchaosshell.js");
	  });
	  $('#upload-script').on('change', function() {
	
		script_name=this.files[0];
	});
$('#load-script').on('click', function() {
	if(script_name==null){
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		$('#terminal').terminal().exec(e.target.result,false);
	};
	reader.readAsText(script_name);
	$('#upload-script').val("");
	script_name=null;
});
</script>
	

</body>
</html>
