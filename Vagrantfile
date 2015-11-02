# -*- mode: ruby -*-
# vi: set ft=ruby :

require "./vagrant-config.rb"

Vagrant.configure(2) do |config|
  
  config.vm.box = "ubuntu/vivid64"
  
  config.vm.network "private_network", ip: DevEnv::IP
  
  config.vm.provider "virtualbox" do |v|
    v.memory = 1024 # MySQL requires 1GiB minimum
  end
  
  config.vm.provision "shell", inline: <<-SHELL
    
    apt-get update
    apt-get install -y php5-cli php-pear php5-mysql git mysql-client 
    if [ ! -e "/usr/local/bin/phpunit" ]; then
      curl -sSL -O https://phar.phpunit.de/phpunit.phar
      chmod a+x phpunit.phar
      mv phpunit.phar /usr/local/bin/phpunit
    fi
    pear install PHP_CodeSniffer
    if [ ! -e "wpcs" ]; then
      git clone -b master \
        https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards.git \
        wpcs
    fi
    phpcs --config-set installed_paths $(pwd)/wpcs
    if [ ! -e /var/www/html ]; then
      mkdir -p /var/www/html
      cd /tmp \
        && curl -o wordpress.tar.gz -sSL https://wordpress.org/wordpress-4.3.tar.gz \
        && tar --strip-components=1 -C /var/www/html/ -xzf wordpress.tar.gz wordpress/ \
        && rm wordpress.tar.gz \
        && chown -R www-data:www-data /var/www/html
    fi
    
  SHELL
  
  config.vm.provision "docker", run: "always" do |d|
    
    d.pull_images "mysql"
    
    d.build_image "/vagrant",
      args: "-t wordpress"
    
    d.run "mysql:5.7",
      auto_assign_name: false,
      args: "--name mysql \
        -e MYSQL_ROOT_PASSWORD=password"
    
    d.run "wordpress",
      auto_assign_name: false,
      args: "--name wordpress \
        -p 0.0.0.0:80:80 \
        --link mysql:mysql \
        -e WORDPRESS_URL=\"" + DevEnv::IP + "\" \
        -e WORDPRESS_TITLE=\"Status\" \
        -e WORDPRESS_ADMIN_USER=\"admin\" \
        -e WORDPRESS_ADMIN_PASSWORD=\"password\" \
        -e WORDPRESS_ADMIN_EMAIL=\"root@localhost.localdomain\" \
        -e TWITTER_OAUTH_KEY=\"#{DevEnv::TWITTER_OAUTH_KEY}\" \
        -e TWITTER_OAUTH_SECRET=\"#{DevEnv::TWITTER_OAUTH_SECRET}\" \
        -e GOOGLE_MAPS_API_KEY=\"#{DevEnv::GOOGLE_MAPS_API_KEY}\" \
        -v /vagrant/src:/var/www/html/wp-content/themes/status"
    
  end
  
  config.vm.provision "shell", run: "always", inline: <<-SHELL
    
    if [ ! -e "/etc/hosts.orig" ]; then
      cp /etc/hosts /etc/hosts.orig
    fi
    cp /etc/hosts.orig /etc/hosts
    echo "$(docker inspect --format='{{.NetworkSettings.IPAddress}}' mysql) mysql" \
      >> /etc/hosts
    FS_ROOT=$(docker info | grep "Root Dir" | /bin/sed -e 's/^.*:\\s*\\(\\S*\\)\\s*/\\1/')
    WP_CON_ID=$(docker inspect --format='{{.Id}}' wordpress)
    while [ ! -e "$FS_ROOT/diff/$WP_CON_ID/var/www/html/wp-config.php" ]; do
      echo "Waiting for WordPress to become ready"
      sleep 1
    done
    rm -f /var/www/html/wp-config.php
    cp -f "$FS_ROOT/diff/$WP_CON_ID/var/www/html/wp-config.php" /var/www/html/wp-config.php
    
  SHELL
  
end
