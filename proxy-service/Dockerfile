FROM nginx:1.23-alpine

COPY frontend/ /usr/share/nginx/html/
COPY proxy-service/default.conf /etc/nginx/conf.d/default.conf
COPY proxy-service/nginx.conf /etc/nginx/nginx.conf