<?php
/**
 * Status WordPress plugin main entry point.
 * @package status
 */

/*
Plugin Name: Status
Plugin URI:  https://github.com/CREATe-centre/status
Description: Status: Twitter Analytics Tool for User Statistics
Version:     0.1.0
Author:      Horizon Digital Economy Research
Author URI:  http:/www.horizon.ac.uk
License:     AGPL3
License URI: http://www.gnu.org/licenses/agpl-3.0.en.html
Text Domain: status
*/
if ( is_admin() ) {
	/**
	 * Includes the menu page.
	 */
	function show_menu_page() {
		include 'view.php';
	}
	add_action('admin_menu', function() {
		add_menu_page( 'Status', 'Status', 'read', 'status', 'show_menu_page' );
	});
}
?>
