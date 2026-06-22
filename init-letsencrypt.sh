#!/bin/bash
set -e

# --- Настройки (изменить перед запуском) ----------------------------
DOMAIN="YOUR_DOMAIN"   # например: evac.mysite.ru
EMAIL="YOUR_EMAIL"     # ваш email для уведомлений Let's Encrypt
STAGING=0              # 1 = тест без rate-limit, 0 = боевой сертификат
# --------------------------------------------------------------------

STAGING_FLAG=""
[ "$STAGING" -eq 1 ] && STAGING_FLAG="--staging"

echo "[1/5] Проверяем наличие сертификата..."
if docker compose run --rm --entrypoint "" certbot \
     test -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null; then
  echo "Сертификат уже существует, запускаем сервисы..."
  docker compose up -d
  exit 0
fi

echo "[2/5] Создаём временный self-signed сертификат (чтобы nginx мог стартовать)..."
docker compose run --rm --entrypoint "" certbot sh -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=localhost'
"

echo "[3/5] Запускаем nginx и приложение..."
docker compose up -d nginx app
echo "Ждём запуска nginx..."
sleep 5

echo "[4/5] Удаляем временный сертификат..."
docker compose run --rm --entrypoint "" certbot sh -c "
  rm -rf /etc/letsencrypt/live/$DOMAIN &&
  rm -rf /etc/letsencrypt/archive/$DOMAIN &&
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
"

echo "[5/5] Запрашиваем настоящий сертификат от Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos --no-eff-email \
  $STAGING_FLAG

echo "Перезагружаем nginx с настоящим сертификатом..."
docker compose exec nginx nginx -s reload

echo "Запускаем контейнер автообновления сертификата..."
docker compose up -d certbot

echo ""
echo "Готово! Сайт доступен по адресу: https://$DOMAIN"
