# -*- mode: ruby -*-
# vi: set ft=ruby :

require "./vagrant-config.rb"

Vagrant.configure(2) do |config|
  
  config.vm.box = "ubuntu/trusty64"
  
  config.vm.network "private_network", ip: DevEnv::IP
  
  config.vm.provider "virtualbox" do |v|
    v.memory = 1024 # MySQL requires 1GiB minimum
  end
  
  config.vm.provision "shell", inline: <<-SHELL
    
    apt-get install -y php5-cli php-pear php5-mysql git
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
    
  SHELL
  
  config.vm.provision "docker" do |d|
    
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
        -v /vagrant/src:/var/www/html/wp-content/plugins/status"
    
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
    if [ -e "/var/www/html" ]; then
      if [ -L "/var/www/html" ]; then
        rm -f /var/www/html
        ln -s "$FS_ROOT/mnt/$WP_CON_ID/var/www/html" /var/www/html
      else
        echo "Warning: cannot create symlink at /var/www/html"
      fi
    else
      mkdir -p /var/www
      ln -s "$FS_ROOT/mnt/$WP_CON_ID/var/www/html" /var/www/html
    fi
    
  SHELL
  
end
