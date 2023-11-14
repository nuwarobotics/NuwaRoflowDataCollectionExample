#### About

- 該專案提供了完整數據收集功能，包括前端網頁、微服務、網頁伺服器、資料庫等項目，並透過docker-compose管理container.

- Hook API說明文件.

<br>

#### Structure

    services
      ├── backend
      │   ├── api             
      │   │   > NodeJS
      │   │   > PORT 8086
      │   │   
      │   │
      │   └── proxy
      │       > NGINX
      │       > PORT 80 / 443
      │
      ├── deployment
      │   > Docker Compose  
      │
      ├── frontend
      │   > Vue.js with NGINX
      │
      ├── database
      │   > MONGO database
      │   > PORT 27017
      │
      └── README.md

<br>

#### Nginx proxy

- 透過Nginx，將協助我們將URL請求導向對應的服務，如當URL請求為/v1/workflow時，則導向api container，反之則返回靜態網頁.

- 此外，配置上可透過listen 443 ssl default_server、ssl_certificate、ssl_certificate_key配置來啟用SSL，如啟用，請自行配置SSL憑證.

- Nginx相關配置檔可到proxy-service/nginx.conf進行修改.

```
upstream api {
    server ntuh:8086;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name  _;

    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_certificate      /etc/nginx/certs/nuwarobotics_com.pem;
    ssl_certificate_key  /etc/nginx/certs/nuwarobotics_com.key;

    resolver 127.0.0.11 valid=30s ipv6=off;
    client_max_body_size 5000M;
    client_body_buffer_size 10M;
    send_timeout 300s;
    large_client_header_buffers 4 16k;
    proxy_buffer_size 64k;
    proxy_buffers 32 32k;
    proxy_busy_buffers_size 128k;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    proxy_send_timeout 300s;
    proxy_read_timeout 3000s;
    proxy_connect_timeout 30s;
    proxy_set_header Host $host;
    proxy_set_header X-Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    underscores_in_headers on;

    location ^~ /v1/workflow {
        set $origin $http_origin;
        if ($request_method = OPTIONS ) {
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            add_header 'Access-Control-Allow-Origin' "$origin" always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PATCH, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Accept, Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            return 204;
        }
        if ($request_method ~ '(GET|POST|PATCH|PUT|DELETE)') {
            add_header Access-Control-Allow-Origin "$origin" always;
            add_header Access-Control-Allow-Methods 'GET, POST, PATCH, PUT, DELETE, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'Content-Type, Accept, Authorization' always;
            add_header Access-Control-Allow-Credentials true always;
        }
        proxy_pass http://api;
    }
    location / {
        root /usr/share/nginx/html;
    }
}
```

<br>

#### Dokcer Compose Configure

腳本包含了Backend API、前端網頁、網頁伺服器與Mongo資料庫相關配置如下

```
docker compose
version: '3.4'
services:
  ntuh:
    build:
      context: ./backend
      dockerfile: ./Dockerfile
    container_name: ntuh
    restart: always
    ports:
      - '8086:8086'
    networks:
      - mynet
    depends_on:
      nginx:
        condition: service_started
      mongo:
        condition: service_healthy
    links:
      - mongo
    command: ['pm2-docker', '/usr/app/pm2/process.json']     

  nginx:
    build:
      context: .
      dockerfile: ./proxy-service/Dockerfile
    container_name: nginx
    restart: always
    ports:
      - '80:80'
      - '443:443'
    networks:
      - mynet

  mongo:
    image: mongo:3.6
    container_name: mongo
    restart: always
    volumes:
      # 請確認目錄權限，是否有權限進行讀取
      - '/usr/local/mongodb/data:/data/db'
      - '/usr/local/mongodb/logs:/var/log/mongodb'
      - './conf/mongod.conf:/etc/mongod.conf'
    ports:
      - '27017:27017'
    networks:
      - mynet
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongo localhost:27017/test --quiet
      interval: 5s
      timeout: 10s
      retries: 5
    command: ['-f', '/etc/mongod.conf']
networks:
  mynet:
    external: true
```

<br>

#### 運行所有Container

```
docker-compose up -d --build workflow
```

<br>

#### 停止所有Container

```
docker-compose down
```

<br>

#### 頁面測試

``` 
test
# Username: "admin" and Password: "123456"
- http://localhost:80
```

<br>

#### API Description

####  HTTP Code

```
HTTP_CODE=500
{
  "status": {
    "code": "10001,
    "message": "INTERNAL_ERROR",
    "description": ""
  },
  "data": {    
  }
}

HTTP_CODE=400
{
  "status": {
    "code": "10002",
    "message": "BAD_REQUEST",
    "description": ""
  },
  "data": {    
  }
}
```

<br>

#### Get Vaiable Information (hook)

#### GET /v1/workflow/project/{project_id}/variable_name/{name}

##### Header
```
* Authorization: Bearer YOUR_ACCESS_TOKEN (optional)
* customer_id: 409a31c7be7f503872f5a3c8 (optional)
```

##### Response

```
// successful
HTTP_CODE=200
{
  "status": {
    "code": "0",
    "message": "OK",
    "description": ""
  },
  "data": {
     "varName": "name",  // variable name
     "dataType": "string", // string or number
     "funcType": "normal", // normal or incr(increment variable)
     "value": "Leo" // the data type based on dataType field   
  }
}
```

<br>

---

<br>


#### Upload Data (hook)

#### POST /v1/workflow/project/{project_id}/collection/variable

##### Header
```
* Content-Type: application/json
* Authorization: Bearer YOUR_ACCESS_TOKEN (optional)
* customer_id: 409a31c7be7f503872f5a3c8 (optional)
```

##### Body

|field|type|describe|
|:----|:----|:----|
|sn|String|robot serial number|
|sessionId|String|session id ([a-z, 0-9]{11}位隨機數 + timestamp (毫秒))|
|variables|Array|variable collection|
|varName|String|variable name|
|value|String or Number|variable value|
|timestamp|Int|// 1687183523|


##### Request

```
{
  "sn": "test001",
  "sessionId": "51usx3s72nh1666764666307",
  "variables": [
    {
        "varName": "cmd",
        "value": "questionnaireFlow"
    },
    {
        "varName": "name",
        "value": "Leo Guo"
    }
  ]
  "timestamp": 1687183523
}
```

##### Response

```
// successful
HTTP_CODE=200
{
  "status": {
    "code": "0",
    "message": "OK",
    "description": ""
  },
  "data": {   
  }
}
```
