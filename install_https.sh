sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx

sudo tee /etc/nginx/sites-available/toeic-master << 'NGINX'
server {
    listen 80;
    server_name toeic-master.dns.army;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/toeic-master /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d toeic-master.dns.army --non-interactive --agree-tos -m tanbeo31102005@gmail.com
