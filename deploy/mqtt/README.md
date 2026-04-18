# MQTT deployment checklist (Nginx + Mosquitto)

Use these files on your server to fix:
- `wss://serveriot.francecentral.cloudapp.azure.com/mqtt` returning `502`
- TCP `1883` timeouts for ESP32

## 1) Mosquitto

1. Copy [mosquitto.conf](mosquitto.conf) to `/etc/mosquitto/mosquitto.conf`.
2. Ensure password file exists:

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd datosiot
```

3. Restart and verify listeners:

```bash
sudo systemctl restart mosquitto
sudo systemctl status mosquitto --no-pager
sudo ss -ltnp | grep -E ':1883|:9001'
```

Expected:
- `0.0.0.0:1883` (or your public interface)
- `127.0.0.1:9001`

## 2) Nginx

1. In your HTTPS `server { ... }` block, include the content from [nginx-mqtt-location.conf](nginx-mqtt-location.conf).
2. Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 3) Network / firewall

Open inbound:
- `443/tcp` (required for WSS from browser)
- `1883/tcp` (required if ESP32 publishes directly from Internet)

If using Azure VM, check NSG rules as well.

## 4) Final validation

From your local machine:

```bash
curl -sS -o /dev/null -w 'HTTPS status: %{http_code}\n' https://serveriot.francecentral.cloudapp.azure.com

curl -sS -i \
  -H 'Connection: Upgrade' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Version: 13' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
  https://serveriot.francecentral.cloudapp.azure.com/mqtt | head -n 20

nc -vz -w 3 serveriot.francecentral.cloudapp.azure.com 1883
```

Expected:
- HTTPS `200`
- WebSocket `101 Switching Protocols`
- Port `1883` open

## 5) Frontend env

Your production env is already set for WSS and topics in [../../.env.production](../../.env.production).
