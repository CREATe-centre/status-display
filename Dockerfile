FROM php:5.6-apache

ENV WORDPRESS_VERSION 4.3
ENV WORDPRESS_SHA1 1e9046b584d4eaebac9e1f7292ca7003bfc8ffd7

RUN a2enmod rewrite

RUN apt-get update

RUN apt-get install -y libpng12-dev libjpeg-dev libbz2-dev \
  && docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr \
  && docker-php-ext-install gd
  
RUN pecl install oauth-1.2.3 \
  && echo "extension=oauth.so" > /usr/local/etc/php/conf.d/oauth.ini

RUN docker-php-ext-install mysqli

RUN docker-php-ext-install bz2

RUN apt-get install -y mysql-client

RUN rm -rf /var/lib/apt/lists/*

RUN cd /tmp \
  && curl -o wordpress.tar.gz -sSL https://wordpress.org/wordpress-${WORDPRESS_VERSION}.tar.gz \
  && echo "$WORDPRESS_SHA1 *wordpress.tar.gz" | sha1sum -c - \
  && tar --strip-components=1 -C /var/www/html/ -xzf wordpress.tar.gz wordpress/ \
  && rm wordpress.tar.gz \
  && chown -R www-data:www-data /var/www/html

RUN cd /tmp \
  && curl -sSL -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod a+x wp-cli.phar \
  && mv wp-cli.phar /usr/bin/wp
  
VOLUME /var/www/html/wp-content/uploads
  
COPY src /var/www/html/wp-content/themes/status
COPY .htaccess /var/www/html/
COPY docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["apache2-foreground"]