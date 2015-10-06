<?php
/**
 * Utility functions.
 * @package status
 */

/**
 * Retrieve a GET parameter by name.
 * @param string $name Parameter name.
 */
function get_param( $name ) {
	isset( $_GET[ $name ] )
	? sanitize_text_field( wp_unslash( $_GET[ $name ] ) )
	: '';
}

?>
