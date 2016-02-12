#!/bin/sh

find src \( -iname '*.php' \) -print0 | xargs -n1 -0 php -l &&
find tests \( -iname '*.php' \) -print0 | xargs -n1 -0 php -l &&
phpcs -psvn --standard=WordPress-Core --ignore=lib/codebird.php \
	--ignore=lib/uuid.php src --ignore=lib/export.php &&
phpcs -psvn --standard=WordPress-Docs --ignore=lib/codebird.php \
  --ignore=lib/uuid.php src --ignore=lib/export.php &&
phpcs -psvn --standard=WordPress-Extra --ignore=lib/codebird.php \
  --ignore=lib/uuid.php src --ignore=lib/export.php &&
phpunit -c phpunit.xml
