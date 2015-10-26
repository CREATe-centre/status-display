#!/bin/sh

find src \( -iname '*.php' \) -print0 | xargs -n1 -0 php -l &&
find tests \( -iname '*.php' \) -print0 | xargs -n1 -0 php -l &&
phpcs -psvn --standard=WordPress --ignore=lib/codebird.php \
    --ignore=lib/uuid.php src &&
phpunit -c phpunit.xml
