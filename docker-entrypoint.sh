#!/bin/bash
set -e

# Adapted from https://github.com/docker-library/wordpress/blob/master/apache/docker-entrypoint.sh 

WP_CLI="/usr/bin/wp --allow-root --path=/var/www/html"

if [ ! -e /var/www/html/wp-config.php ]; then

  if [ -n "$MYSQL_PORT_3306_TCP" ] && [ -z "$WORDPRESS_DB_HOST" ]; then
    WORDPRESS_DB_HOST='mysql'
  fi

  if [ -z "$WORDPRESS_DB_HOST" ]; then
    echo >&2 'error: missing WORDPRESS_DB_HOST and MYSQL_PORT_3306_TCP environment variables'
    echo >&2 '  Did you forget to --link some_mysql_container:mysql or set an external db'
    echo >&2 '  with -e WORDPRESS_DB_HOST=hostname:port?'
    exit 1
  fi

  : ${WORDPRESS_DB_USER:=root}
  if [ "$WORDPRESS_DB_USER" = 'root' ]; then
    : ${WORDPRESS_DB_PASSWORD:=$MYSQL_ENV_MYSQL_ROOT_PASSWORD}
  fi

  : ${WORDPRESS_DB_NAME:=wordpress}

  : ${WORDPRESS_TABLE_PREFIX:=wp_}

  if [ -z "$WORDPRESS_DB_PASSWORD" ]; then
    echo >&2 'error: missing required WORDPRESS_DB_PASSWORD environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_DB_PASSWORD=... ?'
    echo >&2
    echo >&2 '  (Also of interest might be WORDPRESS_DB_USER and WORDPRESS_DB_NAME.)'
    exit 1
  fi

  $WP_CLI core config \
    --dbname=$WORDPRESS_DB_NAME \
    --dbuser=$WORDPRESS_DB_USER \
    --dbpass=$WORDPRESS_DB_PASSWORD \
    --dbhost=$WORDPRESS_DB_HOST \
    --dbprefix=$WORDPRESS_TABLE_PREFIX \
    --skip-check
    
fi

while ! exec 6<>/dev/tcp/${MYSQL_PORT_3306_TCP_ADDR}/${MYSQL_PORT_3306_TCP_PORT}; do
  echo "Waiting for MySQL to be ready"
  sleep 1
done
exec 6>&-
exec 6<&-

if ! $($WP_CLI core is-installed); then
	
  if [ -z "$WORDPRESS_URL" ]; then
    echo >&2 'error: missing required WORDPRESS_URL environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_URL=... ?'
    exit 1
  fi
  
  if [ -z "$WORDPRESS_TITLE" ]; then
    echo >&2 'error: missing required WORDPRESS_TITLE environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_TITLE=... ?'
    exit 1
  fi
  
  if [ -z "$WORDPRESS_ADMIN_USER" ]; then
    echo >&2 'error: missing required WORDPRESS_ADMIN_USER environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_ADMIN_USER=... ?'
    exit 1
  fi
  
  if [ -z "$WORDPRESS_ADMIN_PASSWORD" ]; then
    echo >&2 'error: missing required WORDPRESS_ADMIN_PASSWORD environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_ADMIN_PASSWORD=... ?'
    exit 1
  fi
  
  if [ -z "$WORDPRESS_ADMIN_EMAIL" ]; then
    echo >&2 'error: missing required WORDPRESS_ADMIN_EMAIL environment variable'
    echo >&2 '  Did you forget to -e WORDPRESS_ADMIN_EMAIL=... ?'
    exit 1
  fi
	
  $WP_CLI db create
	
  $WP_CLI core install \
    --url="$WORDPRESS_URL" \
    --title="$WORDPRESS_TITLE" \
    --admin_user="$WORDPRESS_ADMIN_USER" \
    --admin_password="$WORDPRESS_ADMIN_PASSWORD" \
    --admin_email="$WORDPRESS_ADMIN_EMAIL"
      
  $WP_CLI plugin activate status
  $WP_CLI plugin install \
      https://downloads.wordpress.org/plugin/disable-wordpress-updates.zip --activate
  $WP_CLI plugin delete $($WP_CLI plugin list --status=inactive --field=name)
fi

exec "$@"