#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")"

# Читаем переменные из .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

DOMAIN="${DOMAIN:-}"
EMAIL="${LETSENCRYPT_EMAIL:-}"

if [ -z "$DOMAIN" ]; then
  echo "Ошибка: DOMAIN не задан в .env"
  exit 1
fi
if [ -z "$EMAIL" ]; then
  echo "Ошибка: LETSENCRYPT_EMAIL не задан в .env"
  exit 1
fi

echo "[1/7] Домен: $DOMAIN, Email: $EMAIL"

echo "[2/7] Подставляем домен в конфиг nginx..."
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/default.conf

echo "[3/7] Собираем и запускаем приложение..."
docker compose up -d --build app

echo "[4/7] Создаём временный self-signed сертификат..."
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN
  if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=localhost'
  fi
"

echo "[5/7] Запускаем nginx..."
docker compose up -d nginx
sleep 5

echo "[6/7] Удаляем временный сертификат и получаем настоящий..."
docker compose run --rm --entrypoint sh certbot -c "
  rm -rf /etc/letsencrypt/live/$DOMAIN
  rm -rf /etc/letsencrypt/archive/$DOMAIN
  rm -f /etc/letsencrypt/renewal/$DOMAIN.conf
"

docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos --no-eff-email

echo "[7/7] Перезагружаем nginx с настоящим сертификатом..."
docker compose exec nginx nginx -s reload

echo ""
echo "Готово! Сайт доступен: https://$DOMAIN"
echo ""
echo "Добавь автообновление сертификата (crontab -e):"
echo "  0 4 * * * cd $(pwd) && ./renew-letsencrypt.sh >> /var/log/certbot-renew.log 2>&1"
