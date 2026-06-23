#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"

docker compose run --rm --entrypoint certbot certbot renew \
  --webroot --webroot-path /var/www/certbot --quiet

docker compose exec nginx nginx -s reload
