# API routing fix (devices/readings/auth)

## Why this is needed

The frontend is a SPA and uses browser routes.
If Nginx does not proxy API paths first, requests like /devices can return index.html instead of JSON.

This project now uses:
- `VITE_API_BASE_URL=https://serveriot.francecentral.cloudapp.azure.com/api`

So the frontend calls:
- `/api/auth/login`
- `/api/devices`
- `/api/readings`

## Nginx

Add the block from [nginx-api-location.conf](nginx-api-location.conf) inside your HTTPS `server { ... }`.

Then apply:

sudo nginx -t
sudo systemctl reload nginx

## Backend process

Run your Node API on localhost port 3000.
Example checks:

ss -ltnp | grep :3000
curl -sS -i http://127.0.0.1:3000/devices | head -n 20

## End-to-end checks (from local machine)

curl -sS -i https://serveriot.francecentral.cloudapp.azure.com/api/devices | head -n 20
curl -sS -i https://serveriot.francecentral.cloudapp.azure.com/api/readings | head -n 20

Expected: JSON responses (not HTML index page).
