<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 30/06/17
 */

?>

<div class="navbar">
    <div class="navbar-inner">
	<div class="container-fluid">
	    <a class="btn btn-navbar" data-toggle="collapse" data-target=".top-nav.nav-collapse,.sidebar-nav.nav-collapse">
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
	    </a>
	    
            <a class="brand" href="<?php echo $index; ?>"><span>!CHAOS Dashboard</span><?php echo file_get_contents("target.html");echo file_get_contents("version.html");?></a>
								
		<!-- start: Header Menu -->
		<div class="nav-no-collapse header-nav">
		    <ul class="nav pull-right">
						
			<!-- start: User Dropdown -->
			    <li class="dropdown">
				<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				    <i class="halflings-icon white user"></i> Login
				    <span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
				    <li class="dropdown-menu-title">
 					<span>Account Settings</span>
				    </li>
				    <li><a href="#"><i class="halflings-icon user"></i> Profile</a></li>
				    <li><a href="login.html"><i class="halflings-icon off"></i> Logout</a></li>
				</ul>
			    </li>
			<!-- end: User Dropdown -->

			</ul>
		    </div>
		    <!-- end: Header Menu -->
				
	</div>
    </div>
</div>