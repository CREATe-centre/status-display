<?php
/**
 * Settings menu page.

 * @package status
 */

?>
<div>
	<h1>Status Settings</h1>
	<form action="options.php" method="post">
	<?php settings_fields( 'status-options' ); ?>
	<?php do_settings_sections( 'status-options' ); ?>
	<input name="Submit" type="submit" 
			value="<?php esc_attr_e( 'Save Changes' ); ?>" />
	</form>
</div>
